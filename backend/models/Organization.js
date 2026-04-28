// Organization Model
class Organization {
    constructor(pool) {
        this.pool = pool;
    }

    async create(orgData) {
        const { name, email, description, logo_url, website, country } = orgData;
        const query = `
            INSERT INTO organizations (name, email, description, logo_url, website, country)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, description, logo_url, website, country, is_verified, is_active, created_at
        `;
        const result = await this.pool.query(query, [name, email, description, logo_url, website, country]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT id, name, email, description, logo_url, website, country, is_verified, is_active, created_at
            FROM organizations WHERE id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findByEmail(email) {
        const query = 'SELECT * FROM organizations WHERE email = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0];
    }

    async getAll(activeOnly = true) {
        const query = activeOnly
            ? 'SELECT id, name, email, description, logo_url, website, country, is_verified, created_at FROM organizations WHERE is_active = true ORDER BY name'
            : 'SELECT id, name, email, description, logo_url, website, country, is_verified, is_active, created_at FROM organizations ORDER BY name';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async update(id, orgData) {
        const { name, description, logo_url, website, country } = orgData;
        const query = `
            UPDATE organizations
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                logo_url = COALESCE($3, logo_url),
                website = COALESCE($4, website),
                country = COALESCE($5, country),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, name, email, description, logo_url, website, country, is_verified, is_active
        `;
        const result = await this.pool.query(query, [name, description, logo_url, website, country, id]);
        return result.rows[0];
    }
}

module.exports = Organization;
