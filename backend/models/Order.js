// Order Model
class Order {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userId, orderData) {
        const { total_amount, shipping_address, payment_method } = orderData;
        const query = `
            INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
        `;
        const result = await this.pool.query(query, [userId, total_amount, shipping_address, payment_method]);
        return result.rows[0];
    }

    async createFromCart(userId, shippingAddress, paymentMethod) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);

            const cartResult = await client.query(
                'SELECT id FROM shopping_carts WHERE user_id = $1 ORDER BY id LIMIT 1',
                [userId]
            );
            if (cartResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return { error: 'empty' };
            }
            const cartId = cartResult.rows[0].id;

            const itemsResult = await client.query(`
                SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity, p.is_available
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = $1
                ORDER BY ci.product_id
                FOR UPDATE OF ci, p
            `, [cartId]);

            if (itemsResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return { error: 'empty' };
            }

            const unavailable = itemsResult.rows.some((item) =>
                !item.is_available || Number(item.quantity) <= 0 || Number(item.quantity) > Number(item.stock_quantity)
            );
            if (unavailable) {
                await client.query('ROLLBACK');
                return { error: 'stock' };
            }

            const totalResult = await client.query(`
                SELECT COALESCE(SUM(ci.quantity * p.price), 0)::numeric(10,2) AS total
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = $1
            `, [cartId]);
            const total = totalResult.rows[0].total;

            const orderResult = await client.query(`
                INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
                VALUES ($1, $2, $3, $4, 'pending')
                RETURNING *
            `, [userId, total, shippingAddress, paymentMethod]);
            const order = orderResult.rows[0];

            await client.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                SELECT $1, ci.product_id, ci.quantity, p.price
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = $2
            `, [order.id, cartId]);

            await client.query(`
                UPDATE products p
                SET stock_quantity = p.stock_quantity - ci.quantity,
                    updated_at = CURRENT_TIMESTAMP
                FROM cart_items ci
                WHERE ci.cart_id = $1 AND ci.product_id = p.id
            `, [cartId]);

            await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
            await client.query('COMMIT');
            return { order };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async addOrderItems(orderId, items) {
        const results = [];
        for (const item of items) {
            const query = `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await this.pool.query(query, [orderId, item.product_id, item.quantity, item.price]);
            results.push(result.rows[0]);
        }
        return results;
    }

    async findById(id) {
        const query = `
            SELECT o.*,
                   json_agg(
                       json_build_object(
                           'id', oi.id,
                           'product_id', oi.product_id,
                           'quantity', oi.quantity,
                           'price', oi.price
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            GROUP BY o.id
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findByUserId(userId, limit = 50) {
        const query = `
            SELECT * FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows;
    }

    async updateStatus(orderId, status) {
        const query = `
            UPDATE orders
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.pool.query(query, [status, orderId]);
        return result.rows[0];
    }
}

module.exports = Order;
