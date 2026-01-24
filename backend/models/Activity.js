// Activity Model for Social Feed
class Activity {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userId, activityType, activityData, isPublic = true) {
        const query = `
            INSERT INTO activities (user_id, activity_type, activity_data, is_public)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await this.pool.query(query, [userId, activityType, JSON.stringify(activityData), isPublic]);
        return result.rows[0];
    }

    async getUserFeed(userId, limit = 50) {
        // Get activities from users that this user follows, plus their own
        const query = `
            SELECT a.*, u.username, u.avatar_url
            FROM activities a
            JOIN users u ON a.user_id = u.id
            WHERE a.is_public = true
            AND (a.user_id = $1 OR a.user_id IN (
                SELECT following_id FROM user_follows WHERE follower_id = $1
            ))
            ORDER BY a.created_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows;
    }

    async getPublicFeed(limit = 50) {
        const query = `
            SELECT a.*, u.username, u.avatar_url
            FROM activities a
            JOIN users u ON a.user_id = u.id
            WHERE a.is_public = true
            ORDER BY a.created_at DESC
            LIMIT $1
        `;
        const result = await this.pool.query(query, [limit]);
        return result.rows;
    }

    async getUserActivities(userId, limit = 50) {
        const query = `
            SELECT * FROM activities
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
        const result = await this.pool.query(query, [userId, limit]);
        return result.rows;
    }

    async delete(activityId, userId) {
        const query = 'DELETE FROM activities WHERE id = $1 AND user_id = $2';
        await this.pool.query(query, [activityId, userId]);
    }
}

module.exports = Activity;
