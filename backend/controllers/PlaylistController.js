// Playlist Controller
const Playlist = require('../models/Playlist');
const Activity = require('../models/Activity');

class PlaylistController {
    constructor(pool) {
        this.playlistModel = new Playlist(pool);
        this.activityModel = new Activity(pool);
    }

    async createPlaylist(req, res) {
        try {
            const userId = req.user.id;
            const playlist = await this.playlistModel.create(userId, req.body);
            
            // Create activity
            await this.activityModel.create(userId, 'playlist_created', {
                playlist_id: playlist.id,
                playlist_name: playlist.name
            });
            
            res.status(201).json(playlist);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPlaylist(req, res) {
        try {
            const playlist = await this.playlistModel.findById(req.params.id);
            
            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }
            
            const tracks = await this.playlistModel.getTracks(req.params.id);
            
            res.json({
                ...playlist,
                tracks
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserPlaylists(req, res) {
        try {
            const userId = req.params.userId || req.user.id;
            const playlists = await this.playlistModel.findByUserId(userId);
            res.json(playlists);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPublicPlaylists(req, res) {
        try {
            const playlists = await this.playlistModel.getPublicPlaylists();
            res.json(playlists);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updatePlaylist(req, res) {
        try {
            const playlist = await this.playlistModel.update(req.params.id, req.body);
            
            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }
            
            res.json(playlist);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deletePlaylist(req, res) {
        try {
            await this.playlistModel.delete(req.params.id);
            res.json({ message: 'Playlist deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addTrack(req, res) {
        try {
            const { playlistId, trackId } = req.body;
            const track = await this.playlistModel.addTrack(playlistId, trackId);
            res.status(201).json(track);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async removeTrack(req, res) {
        try {
            const { playlistId, trackId } = req.params;
            await this.playlistModel.removeTrack(playlistId, trackId);
            res.json({ message: 'Track removed from playlist' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = PlaylistController;
