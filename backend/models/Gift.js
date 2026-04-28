// Gift Model - supports cross-platform gifts from organizations to users
class Gift {
    constructor(pool) {
        this.pool = pool;
    }

    async create(giftData) {
        const { organization_id, recipient_id, amount, currency = 'USD', message, payment_method, payment_reference, paynow_link } = giftData;
        const query = `
            INSERT INTO gifts (organization_id, recipient_id, amount, currency, message, payment_method, payment_reference, paynow_link, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
            RETURNING *
        `;
        const result = await this.pool.query(query, [organization_id, recipient_id, amount, currency, message, payment_method, payment_reference, paynow_link]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT g.*,
                   o.name AS organization_name,
                   o.email AS organization_email,
                   o.logo_url AS organization_logo,
                   o.is_verified AS organization_verified,
                   u.username AS recipient_username,
                   u.full_name AS recipient_full_name,
                   u.email AS recipient_email
            FROM gifts g
            JOIN organizations o ON g.organization_id = o.id
            JOIN users u ON g.recipient_id = u.id
            WHERE g.id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async getReceivedGifts(userId, limit = 50) {
        const query = `
            SELECT g.*,
                   o.name AS organization_name,
                   o.email AS organization_email,
                   o.logo_url AS organization_logo,
                   o.is_verified AS organization_verified
            FROM gifts g
            JOIN organizations o ON g.organization_id = o.id
            WHERE g.recipient_id = $1
            ORDER BY g.sent_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows;
    }

    async getSentGifts(organizationId, limit = 50) {
        const query = `
            SELECT g.*,
                   u.username AS recipient_username,
                   u.full_name AS recipient_full_name,
                   u.email AS recipient_email
            FROM gifts g
            JOIN users u ON g.recipient_id = u.id
            WHERE g.organization_id = $1
            ORDER BY g.sent_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [organizationId, limit]);
        return result.rows;
    }

    async updatePaynowLink(giftId, paynowLink) {
        const query = `
            UPDATE gifts
            SET paynow_link = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await this.pool.query(query, [paynowLink, giftId]);
        return result.rows[0];
    }

    async updateStatus(giftId, status, paymentReference = null) {
        const query = `
            UPDATE gifts
            SET status = $1,
                payment_reference = COALESCE($2, payment_reference),
                claimed_at = CASE WHEN $1 = 'claimed' THEN CURRENT_TIMESTAMP ELSE claimed_at END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const result = await this.pool.query(query, [status, paymentReference, giftId]);
        return result.rows[0];
    }

    async getStats(organizationId) {
        const query = `
            SELECT
                COUNT(*) AS total_gifts,
                SUM(amount) AS total_amount,
                SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) AS claimed_gifts,
                SUM(CASE WHEN status = 'claimed' THEN amount ELSE 0 END) AS claimed_amount,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_gifts,
                currency
            FROM gifts
            WHERE organization_id = $1
            GROUP BY currency
        `;
        const result = await this.pool.query(query, [organizationId]);
        return result.rows;
    }
}

module.exports = Gift;
