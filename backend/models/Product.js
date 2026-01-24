// Product Model for E-commerce
class Product {
    constructor(pool) {
        this.pool = pool;
    }

    async create(productData) {
        const { name, description, price, category, image_url, stock_quantity } = productData;
        const query = `
            INSERT INTO products (name, description, price, category, image_url, stock_quantity)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await this.pool.query(query, [name, description, price, category, image_url, stock_quantity]);
        return result.rows[0];
    }

    async findById(id) {
        const query = 'SELECT * FROM products WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findAll(filters = {}) {
        let query = 'SELECT * FROM products WHERE is_available = true';
        const params = [];
        
        if (filters.category) {
            params.push(filters.category);
            query += ` AND category = $${params.length}`;
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await this.pool.query(query, params);
        return result.rows;
    }

    async update(id, productData) {
        const { name, description, price, category, stock_quantity, is_available } = productData;
        const query = `
            UPDATE products
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                category = COALESCE($4, category),
                stock_quantity = COALESCE($5, stock_quantity),
                is_available = COALESCE($6, is_available),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
        `;
        const result = await this.pool.query(query, [name, description, price, category, stock_quantity, is_available, id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM products WHERE id = $1';
        await this.pool.query(query, [id]);
    }

    async updateStock(id, quantity) {
        const query = `
            UPDATE products
            SET stock_quantity = stock_quantity + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.pool.query(query, [quantity, id]);
        return result.rows[0];
    }
}

module.exports = Product;
