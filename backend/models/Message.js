// Message Model for Private Messaging
class Message {
    constructor(pool) {
        this.pool = pool;
    }

    async send(senderId, recipientId, subject, content) {
        const query = `
            INSERT INTO messages (sender_id, recipient_id, subject, content)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await this.pool.query(query, [senderId, recipientId, subject, content]);
        return result.rows[0];
    }

    async getInbox(userId, limit = 50) {
        const query = `
            SELECT m.*, u.username as sender_username, u.avatar_url as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.recipient_id = $1
            ORDER BY m.created_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows;
    }

    async getSent(userId, limit = 50) {
        const query = `
            SELECT m.*, u.username as recipient_username, u.avatar_url as recipient_avatar
            FROM messages m
            JOIN users u ON m.recipient_id = u.id
            WHERE m.sender_id = $1
            ORDER BY m.created_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows;
    }

    async markAsRead(messageId, userId) {
        const query = `
            UPDATE messages
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND recipient_id = $2
            RETURNING *
        `;
        const result = await this.pool.query(query, [messageId, userId]);
        return result.rows[0];
    }

    async getUnreadCount(userId) {
        const query = 'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false';
        const result = await this.pool.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }

    async delete(messageId, userId) {
        // Only allow deletion if user is sender or recipient
        const query = `
            DELETE FROM messages
            WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)
        `;
        await this.pool.query(query, [messageId, userId]);
    }
}

module.exports = Message;
