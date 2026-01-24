// Playlist Model
class Playlist {
    constructor(pool) {
        this.pool = pool;
    }

    async create(userId, playlistData) {
        const { name, description, is_public, cover_image_url } = playlistData;
        const query = `
            INSERT INTO playlists (user_id, name, description, is_public, cover_image_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await this.pool.query(query, [userId, name, description, is_public, cover_image_url]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT p.*, u.username as owner_username
            FROM playlists p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findByUserId(userId) {
        const query = 'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await this.pool.query(query, [userId]);
        return result.rows;
    }

    async getPublicPlaylists() {
        const query = `
            SELECT p.*, u.username as owner_username
            FROM playlists p
            JOIN users u ON p.user_id = u.id
            WHERE p.is_public = true
            ORDER BY p.created_at DESC
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async addTrack(playlistId, trackId) {
        // Get max position
        let query = 'SELECT COALESCE(MAX(position), 0) as max_pos FROM playlist_tracks WHERE playlist_id = $1';
        let result = await this.pool.query(query, [playlistId]);
        const position = result.rows[0].max_pos + 1;
        
        query = `
            INSERT INTO playlist_tracks (playlist_id, track_id, position)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING
            RETURNING *
        `;
        result = await this.pool.query(query, [playlistId, trackId, position]);
        return result.rows[0];
    }

    async removeTrack(playlistId, trackId) {
        const query = 'DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2';
        await this.pool.query(query, [playlistId, trackId]);
    }

    async getTracks(playlistId) {
        const query = `
            SELECT t.*, pt.position
            FROM tracks t
            JOIN playlist_tracks pt ON t.id = pt.track_id
            WHERE pt.playlist_id = $1
            ORDER BY pt.position
        `;
        const result = await this.pool.query(query, [playlistId]);
        return result.rows;
    }

    async update(id, playlistData) {
        const { name, description, is_public, cover_image_url } = playlistData;
        const query = `
            UPDATE playlists
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                is_public = COALESCE($3, is_public),
                cover_image_url = COALESCE($4, cover_image_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;
        const result = await this.pool.query(query, [name, description, is_public, cover_image_url, id]);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM playlists WHERE id = $1';
        await this.pool.query(query, [id]);
    }
}

module.exports = Playlist;
