// Shopping Cart Model
class ShoppingCart {
    constructor(pool) {
        this.pool = pool;
    }

    async getOrCreateCart(userId) {
        // Check if cart exists
        let query = 'SELECT * FROM shopping_carts WHERE user_id = $1';
        let result = await this.pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            // Create new cart
            query = 'INSERT INTO shopping_carts (user_id) VALUES ($1) RETURNING *';
            result = await this.pool.query(query, [userId]);
        }
        
        return result.rows[0];
    }

    async addItem(userId, productId, quantity = 1) {
        const cart = await this.getOrCreateCart(userId);
        
        // Check if item already in cart
        let query = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
        let result = await this.pool.query(query, [cart.id, productId]);
        
        if (result.rows.length > 0) {
            // Update quantity
            query = `
                UPDATE cart_items
                SET quantity = quantity + $1
                WHERE cart_id = $2 AND product_id = $3
                RETURNING *
            `;
            result = await this.pool.query(query, [quantity, cart.id, productId]);
        } else {
            // Insert new item
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
            UPDATE cart_items
            SET quantity = $1
            WHERE cart_id = $2 AND product_id = $3
            RETURNING *
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
            SELECT SUM(ci.quantity * p.price) as total
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
        `;
        const result = await this.pool.query(query, [cart.id]);
        return result.rows[0].total || 0;
    }
}

module.exports = ShoppingCart;
