// User Controller
const User = require('../models/User');

class UserController {
    constructor(pool) {
        this.userModel = new User(pool);
    }

    async getProfile(req, res) {
        try {
            const userId = req.params.id || req.user.id;
            const user = await this.userModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updatedUser = await this.userModel.update(userId, req.body);
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFollowers(req, res) {
        try {
            const userId = req.params.id;
            const followers = await this.userModel.getFollowers(userId);
            res.json(followers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFollowing(req, res) {
        try {
            const userId = req.params.id;
            const following = await this.userModel.getFollowing(userId);
            res.json(following);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async follow(req, res) {
        try {
            const followerId = req.user.id;
            const followingId = req.params.id;
            
            if (followerId === parseInt(followingId)) {
                return res.status(400).json({ error: 'Cannot follow yourself' });
            }
            
            await this.userModel.follow(followerId, followingId);
            res.json({ message: 'Successfully followed user' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async unfollow(req, res) {
        try {
            const followerId = req.user.id;
            const followingId = req.params.id;
            
            await this.userModel.unfollow(followerId, followingId);
            res.json({ message: 'Successfully unfollowed user' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;
