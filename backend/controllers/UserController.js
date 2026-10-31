// User Controller
const User = require('../models/User');
const { positiveInt, cleanString, optionalHttpUrl, sendValidationError } = require('../middleware/validation');
const { handleServerError } = require('../utils/http');

class UserController {
    constructor(pool) {
        this.userModel = new User(pool);
    }

    async getProfile(req, res) {
        try {
            const userId = positiveInt(req.params.id);
            if (!userId) return sendValidationError(res, 'Invalid user id');

            const user = await this.userModel.findById(userId);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error) {
            return handleServerError(res, error, 'users:get-profile');
        }
    }

    async getMe(req, res) {
        try {
            const user = await this.userModel.findPrivateById(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error) {
            return handleServerError(res, error, 'users:get-me');
        }
    }

    async updateProfile(req, res) {
        try {
            const fullName = cleanString(req.body.full_name, { max: 100 });
            const bio = cleanString(req.body.bio, { max: 1000 });
            const avatarUrl = optionalHttpUrl(req.body.avatar_url);
            if (fullName === null || bio === null || avatarUrl === null) {
                return sendValidationError(res, 'Invalid profile fields');
            }

            const updatedUser = await this.userModel.update(req.user.id, {
                full_name: fullName,
                bio,
                avatar_url: avatarUrl
            });
            res.json(updatedUser);
        } catch (error) {
            return handleServerError(res, error, 'users:update-profile');
        }
    }

    async getFollowers(req, res) {
        try {
            const userId = positiveInt(req.params.id);
            if (!userId) return sendValidationError(res, 'Invalid user id');
            const followers = await this.userModel.getFollowers(userId);
            res.json(followers);
        } catch (error) {
            return handleServerError(res, error, 'users:get-followers');
        }
    }

    async getFollowing(req, res) {
        try {
            const userId = positiveInt(req.params.id);
            if (!userId) return sendValidationError(res, 'Invalid user id');
            const following = await this.userModel.getFollowing(userId);
            res.json(following);
        } catch (error) {
            return handleServerError(res, error, 'users:get-following');
        }
    }

    async follow(req, res) {
        try {
            const followingId = positiveInt(req.params.id);
            if (!followingId) return sendValidationError(res, 'Invalid user id');
            if (req.user.id === followingId) {
                return res.status(400).json({ error: 'Cannot follow yourself' });
            }

            await this.userModel.follow(req.user.id, followingId);
            res.json({ message: 'Successfully followed user' });
        } catch (error) {
            return handleServerError(res, error, 'users:follow');
        }
    }

    async unfollow(req, res) {
        try {
            const followingId = positiveInt(req.params.id);
            if (!followingId) return sendValidationError(res, 'Invalid user id');
            await this.userModel.unfollow(req.user.id, followingId);
            res.json({ message: 'Successfully unfollowed user' });
        } catch (error) {
            return handleServerError(res, error, 'users:unfollow');
        }
    }
}

module.exports = UserController;
