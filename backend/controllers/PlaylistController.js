// Playlist Controller
const Playlist = require('../models/Playlist');
const Activity = require('../models/Activity');
const { positiveInt, cleanString, optionalHttpUrl, sendValidationError } = require('../middleware/validation');
const { handleServerError } = require('../utils/http');

class PlaylistController {
    constructor(pool) {
        this.playlistModel = new Playlist(pool);
        this.activityModel = new Activity(pool);
    }

    validatePlaylistBody(body) {
        const name = cleanString(body.name, { min: 1, max: 120, required: false });
        const description = cleanString(body.description, { max: 2000 });
        const coverImageUrl = optionalHttpUrl(body.cover_image_url);
        const isPublic = body.is_public == null ? undefined : body.is_public;

        if (name === null || description === null || coverImageUrl === null) return null;
        if (isPublic !== undefined && typeof isPublic !== 'boolean') return null;
        return { name, description, is_public: isPublic, cover_image_url: coverImageUrl };
    }

    async createPlaylist(req, res) {
        try {
            const payload = this.validatePlaylistBody(req.body);
            if (!payload || !payload.name) return sendValidationError(res, 'Playlist name is required');

            const playlist = await this.playlistModel.create(req.user.id, {
                ...payload,
                is_public: payload.is_public ?? false
            });
            await this.activityModel.create(req.user.id, 'playlist_created', {
                playlist_id: playlist.id,
                playlist_name: playlist.name
            }, playlist.is_public);
            res.status(201).json(playlist);
        } catch (error) {
            return handleServerError(res, error, 'playlists:create');
        }
    }

    async getPlaylist(req, res) {
        try {
            const playlistId = positiveInt(req.params.id);
            if (!playlistId) return sendValidationError(res, 'Invalid playlist id');

            const playlist = await this.playlistModel.findPublicById(playlistId);
            if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

            const tracks = await this.playlistModel.getTracks(playlistId);
            res.json({ ...playlist, tracks });
        } catch (error) {
            return handleServerError(res, error, 'playlists:get');
        }
    }

    async getUserPlaylists(req, res) {
        try {
            const userId = positiveInt(req.params.userId);
            if (!userId) return sendValidationError(res, 'Invalid user id');
            const playlists = await this.playlistModel.findByUserId(userId, false);
            res.json(playlists);
        } catch (error) {
            return handleServerError(res, error, 'playlists:get-user');
        }
    }

    async getMyPlaylists(req, res) {
        try {
            const playlists = await this.playlistModel.findByUserId(req.user.id, true);
            res.json(playlists);
        } catch (error) {
            return handleServerError(res, error, 'playlists:get-mine');
        }
    }

    async getPublicPlaylists(req, res) {
        try {
            const playlists = await this.playlistModel.getPublicPlaylists();
            res.json(playlists);
        } catch (error) {
            return handleServerError(res, error, 'playlists:get-public');
        }
    }

    async updatePlaylist(req, res) {
        try {
            const playlistId = positiveInt(req.params.id);
            const payload = this.validatePlaylistBody(req.body);
            if (!playlistId || !payload) return sendValidationError(res, 'Invalid playlist update');

            const playlist = await this.playlistModel.update(playlistId, payload, req.user.id);
            if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
            res.json(playlist);
        } catch (error) {
            return handleServerError(res, error, 'playlists:update');
        }
    }

    async deletePlaylist(req, res) {
        try {
            const playlistId = positiveInt(req.params.id);
            if (!playlistId) return sendValidationError(res, 'Invalid playlist id');
            const deleted = await this.playlistModel.delete(playlistId, req.user.id);
            if (!deleted) return res.status(404).json({ error: 'Playlist not found' });
            res.json({ message: 'Playlist deleted successfully' });
        } catch (error) {
            return handleServerError(res, error, 'playlists:delete');
        }
    }

    async addTrack(req, res) {
        try {
            const playlistId = positiveInt(req.body.playlistId);
            const trackId = positiveInt(req.body.trackId);
            if (!playlistId || !trackId) return sendValidationError(res, 'Invalid playlist or track id');

            const track = await this.playlistModel.addTrack(playlistId, trackId, req.user.id);
            if (!track) return res.status(404).json({ error: 'Playlist not found or track already present' });
            res.status(201).json(track);
        } catch (error) {
            return handleServerError(res, error, 'playlists:add-track');
        }
    }

    async removeTrack(req, res) {
        try {
            const playlistId = positiveInt(req.params.playlistId);
            const trackId = positiveInt(req.params.trackId);
            if (!playlistId || !trackId) return sendValidationError(res, 'Invalid playlist or track id');

            const removed = await this.playlistModel.removeTrack(playlistId, trackId, req.user.id);
            if (!removed) return res.status(404).json({ error: 'Playlist or track not found' });
            res.json({ message: 'Track removed from playlist' });
        } catch (error) {
            return handleServerError(res, error, 'playlists:remove-track');
        }
    }
}

module.exports = PlaylistController;
