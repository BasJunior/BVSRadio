// Activity Controller for Social Feed
const Activity = require('../models/Activity');

class ActivityController {
    constructor(pool) {
        this.activityModel = new Activity(pool);
    }

    async getFeed(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            const limit = parseInt(req.query.limit) || 50;
            
            let activities;
            if (userId) {
                activities = await this.activityModel.getUserFeed(userId, limit);
            } else {
                activities = await this.activityModel.getPublicFeed(limit);
            }
            
            res.json(activities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserActivities(req, res) {
        try {
            const userId = req.params.userId;
            const limit = parseInt(req.query.limit) || 50;
            
            const activities = await this.activityModel.getUserActivities(userId, limit);
            res.json(activities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createActivity(req, res) {
        try {
            const userId = req.user.id;
            const { activityType, activityData, isPublic } = req.body;
            
            const activity = await this.activityModel.create(userId, activityType, activityData, isPublic);
            res.status(201).json(activity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteActivity(req, res) {
        try {
            const userId = req.user.id;
            const activityId = req.params.id;
            
            await this.activityModel.delete(activityId, userId);
            res.json({ message: 'Activity deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ActivityController;
