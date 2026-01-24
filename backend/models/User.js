// User Model
const { Pool } = require('pg');

class User {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userData) {
        const { username, email, password_hash, full_name, bio } = userData;
        const query = `
            INSERT INTO users (username, email, password_hash, full_name, bio)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, full_name, bio, created_at
        `;
        const result = await this.pool.query(query, [username, email, password_hash, full_name, bio]);
        return result.rows[0];
    }

    async findById(id) {
        const query = 'SELECT id, username, email, full_name, bio, avatar_url, created_at FROM users WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0];
    }

    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await this.pool.query(query, [username]);
        return result.rows[0];
    }

    async update(id, userData) {
        const { full_name, bio, avatar_url } = userData;
        const query = `
            UPDATE users 
            SET full_name = COALESCE($1, full_name),
                bio = COALESCE($2, bio),
                avatar_url = COALESCE($3, avatar_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, username, email, full_name, bio, avatar_url
        `;
        const result = await this.pool.query(query, [full_name, bio, avatar_url, id]);
        return result.rows[0];
    }

    async getFollowers(userId) {
        const query = `
            SELECT u.id, u.username, u.full_name, u.avatar_url
            FROM users u
            INNER JOIN user_follows uf ON u.id = uf.follower_id
            WHERE uf.following_id = $1
        `;
        const result = await this.pool.query(query, [userId]);
        return result.rows;
    }

    async getFollowing(userId) {
        const query = `
            SELECT u.id, u.username, u.full_name, u.avatar_url
            FROM users u
            INNER JOIN user_follows uf ON u.id = uf.following_id
            WHERE uf.follower_id = $1
        `;
        const result = await this.pool.query(query, [userId]);
        return result.rows;
    }

    async follow(followerId, followingId) {
        const query = `
            INSERT INTO user_follows (follower_id, following_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING *
        `;
        const result = await this.pool.query(query, [followerId, followingId]);
        return result.rows[0];
    }

    async unfollow(followerId, followingId) {
        const query = 'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2';
        await this.pool.query(query, [followerId, followingId]);
    }
}

module.exports = User;
