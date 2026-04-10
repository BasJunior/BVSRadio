// Interview Podcast Model
class InterviewPodcast {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userId, podcastData) {
        const { title, description, host, guest, video_url, thumbnail_url, duration, category, tags, is_published } = podcastData;
        const published_at = is_published ? new Date() : null;
        const query = `
            INSERT INTO interview_podcasts
                (user_id, title, description, host, guest, video_url, thumbnail_url, duration, category, tags, is_published, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const result = await this.pool.query(query, [
            userId, title, description, host, guest,
            video_url, thumbnail_url, duration, category,
            tags, is_published || false, published_at
        ]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT ip.*, u.username as created_by_username
            FROM interview_podcasts ip
            LEFT JOIN users u ON ip.user_id = u.id
            WHERE ip.id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findAll(filters = {}) {
        const params = [];
        let conditions = ['ip.is_published = true'];

        if (filters.category) {
            params.push(filters.category);
            conditions.push(`ip.category = $${params.length}`);
        }

        if (filters.host) {
            params.push(`%${filters.host}%`);
            conditions.push(`ip.host ILIKE $${params.length}`);
        }

        if (filters.guest) {
            params.push(`%${filters.guest}%`);
            conditions.push(`ip.guest ILIKE $${params.length}`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const query = `
            SELECT ip.*, u.username as created_by_username
            FROM interview_podcasts ip
            LEFT JOIN users u ON ip.user_id = u.id
            ${where}
            ORDER BY ip.published_at DESC
        `;
        const result = await this.pool.query(query, params);
        return result.rows;
    }

    async findByUserId(userId) {
        const query = `
            SELECT * FROM interview_podcasts
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await this.pool.query(query, [userId]);
        return result.rows;
    }

    async incrementViewCount(id) {
        const query = `
            UPDATE interview_podcasts
            SET view_count = view_count + 1
            WHERE id = $1
            RETURNING view_count
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async update(id, podcastData) {
        const { title, description, host, guest, video_url, thumbnail_url, duration, category, tags, is_published } = podcastData;

        // Set published_at only when transitioning to published for the first time
        const publishedAtClause = is_published === true
            ? `published_at = COALESCE(published_at, CURRENT_TIMESTAMP),`
            : '';

        const query = `
            UPDATE interview_podcasts
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                host = COALESCE($3, host),
                guest = COALESCE($4, guest),
                video_url = COALESCE($5, video_url),
                thumbnail_url = COALESCE($6, thumbnail_url),
                duration = COALESCE($7, duration),
                category = COALESCE($8, category),
                tags = COALESCE($9, tags),
                is_published = COALESCE($10, is_published),
                ${publishedAtClause}
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *
        `;
        const result = await this.pool.query(query, [
            title, description, host, guest, video_url,
            thumbnail_url, duration, category, tags, is_published, id
        ]);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM interview_podcasts WHERE id = $1';
        await this.pool.query(query, [id]);
    }
}

module.exports = InterviewPodcast;
