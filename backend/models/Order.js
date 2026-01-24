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
