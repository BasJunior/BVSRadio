// Conversation Model - handles AI assistant conversation history
class Conversation {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userId, message, role = 'user') {
        const query = `
            INSERT INTO conversations (user_id, message, role, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `;
        const result = await this.pool.query(query, [userId, message, role]);
        return result.rows[0];
    }

    async getHistory(userId, limit = 20) {
        const query = `
            SELECT * FROM conversations
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows.reverse(); // Return in chronological order
    }

    async deleteHistory(userId) {
        const query = `DELETE FROM conversations WHERE user_id = $1`;
        await this.pool.query(query, [userId]);
        return { message: 'Conversation history deleted' };
    }
}

module.exports = Conversation;
