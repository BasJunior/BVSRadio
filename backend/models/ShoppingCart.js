// Shopping Cart Model
class ShoppingCart {
    constructor(pool) {
        this.pool = pool;
    }

    async getOrCreateCart(userId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Serialize cart creation per user even if an older database is missing
            // a UNIQUE(user_id) constraint.
            await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);

            let result = await client.query(
                'SELECT * FROM shopping_carts WHERE user_id = $1 ORDER BY id LIMIT 1',
                [userId]
            );
            if (result.rows.length === 0) {
                result = await client.query('INSERT INTO shopping_carts (user_id) VALUES ($1) RETURNING *', [userId]);
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async addItem(userId, productId, quantity = 1) {
        const cart = await this.getOrCreateCart(userId);
        const product = await this.pool.query(
            'SELECT id, stock_quantity FROM products WHERE id = $1 AND is_available = true',
            [productId]
        );
        if (product.rows.length === 0 || product.rows[0].stock_quantity < quantity) return null;

        let query = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
        let result = await this.pool.query(query, [cart.id, productId]);

        if (result.rows.length > 0) {
            const newQuantity = Number(result.rows[0].quantity) + quantity;
            if (newQuantity > product.rows[0].stock_quantity) return null;
            query = `
                UPDATE cart_items
                SET quantity = $1
                WHERE cart_id = $2 AND product_id = $3
                RETURNING *
            `;
            result = await this.pool.query(query, [newQuantity, cart.id, productId]);
        } else {
            query = `
                INSERT INTO cart_items (cart_id, product_id, quantity)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            result = await this.pool.query(query, [cart.id, productId, quantity]);
        }

        return result.rows[0];
    }

    async getItems(userId) {
        const cart = await this.getOrCreateCart(userId);
        const query = `
            SELECT ci.*, p.name, p.description, p.price, p.image_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
        `;
        const result = await this.pool.query(query, [cart.id]);
        return result.rows;
    }

    async removeItem(userId, productId) {
        const cart = await this.getOrCreateCart(userId);
        const query = 'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2';
        await this.pool.query(query, [cart.id, productId]);
    }

    async updateItemQuantity(userId, productId, quantity) {
        const cart = await this.getOrCreateCart(userId);
        const query = `
            UPDATE cart_items ci
            SET quantity = $1
            FROM products p
            WHERE ci.cart_id = $2
              AND ci.product_id = $3
              AND p.id = ci.product_id
              AND p.is_available = true
              AND p.stock_quantity >= $1
            RETURNING ci.*
        `;
        const result = await this.pool.query(query, [quantity, cart.id, productId]);
        return result.rows[0];
    }

    async clear(userId) {
        const cart = await this.getOrCreateCart(userId);
        const query = 'DELETE FROM cart_items WHERE cart_id = $1';
        await this.pool.query(query, [cart.id]);
    }

    async getTotalAmount(userId) {
        const cart = await this.getOrCreateCart(userId);
        const query = `
            SELECT COALESCE(SUM(ci.quantity * p.price), 0) as total
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1 AND p.is_available = true
        `;
        const result = await this.pool.query(query, [cart.id]);
        return result.rows[0].total;
    }
}

module.exports = ShoppingCart;
