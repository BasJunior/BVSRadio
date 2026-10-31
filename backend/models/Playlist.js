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

    async findPublicById(id) {
        const query = `
            SELECT p.*, u.username as owner_username
            FROM playlists p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1 AND p.is_public = true
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    async findByUserId(userId, includePrivate = false) {
        const query = `
            SELECT * FROM playlists
            WHERE user_id = $1 ${includePrivate ? '' : 'AND is_public = true'}
            ORDER BY created_at DESC
        `;
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

    async addTrack(playlistId, trackId, userId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const owner = await client.query('SELECT id FROM playlists WHERE id = $1 AND user_id = $2 FOR UPDATE', [playlistId, userId]);
            if (owner.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            const positionResult = await client.query(
                'SELECT COALESCE(MAX(position), 0) + 1 AS position FROM playlist_tracks WHERE playlist_id = $1',
                [playlistId]
            );
            const position = positionResult.rows[0].position;
            const result = await client.query(`
                INSERT INTO playlist_tracks (playlist_id, track_id, position)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
                RETURNING *
            `, [playlistId, trackId, position]);
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async removeTrack(playlistId, trackId, userId) {
        const query = `
            DELETE FROM playlist_tracks pt
            USING playlists p
            WHERE pt.playlist_id = p.id
              AND pt.playlist_id = $1
              AND pt.track_id = $2
              AND p.user_id = $3
            RETURNING pt.id
        `;
        const result = await this.pool.query(query, [playlistId, trackId, userId]);
        return result.rowCount > 0;
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

    async update(id, playlistData, userId) {
        const { name, description, is_public, cover_image_url } = playlistData;
        const query = `
            UPDATE playlists
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                is_public = COALESCE($3, is_public),
                cover_image_url = COALESCE($4, cover_image_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 AND user_id = $6
            RETURNING *
        `;
        const result = await this.pool.query(query, [name, description, is_public, cover_image_url, id, userId]);
        return result.rows[0];
    }

    async delete(id, userId) {
        const query = 'DELETE FROM playlists WHERE id = $1 AND user_id = $2 RETURNING id';
        const result = await this.pool.query(query, [id, userId]);
        return result.rowCount > 0;
    }
}

module.exports = Playlist;
