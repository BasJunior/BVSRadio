// Activity Controller for Social Feed
const Activity = require('../models/Activity');
const { positiveInt, boundedInt, cleanString, sendValidationError } = require('../middleware/validation');
const { handleServerError } = require('../utils/http');

class ActivityController {
    constructor(pool) {
        this.activityModel = new Activity(pool);
    }

    async getFeed(req, res) {
        try {
            const limit = boundedInt(req.query.limit ?? 50, { min: 1, max: 100 });
            if (!limit) return sendValidationError(res, 'Invalid limit');
            const activities = await this.activityModel.getPublicFeed(limit);
            res.json(activities);
        } catch (error) {
            return handleServerError(res, error, 'activities:feed');
        }
    }

    async getUserActivities(req, res) {
        try {
            const userId = positiveInt(req.params.userId);
            const limit = boundedInt(req.query.limit ?? 50, { min: 1, max: 100 });
            if (!userId || !limit) return sendValidationError(res, 'Invalid user id or limit');
            const activities = await this.activityModel.getUserActivities(userId, limit);
            res.json(activities);
        } catch (error) {
            return handleServerError(res, error, 'activities:user');
        }
    }

    async createActivity(req, res) {
        try {
            const activityType = cleanString(req.body.activityType, { min: 1, max: 64, required: true });
            const activityData = req.body.activityData;
            const isPublic = req.body.isPublic == null ? true : req.body.isPublic;
            if (!activityType || !activityData || typeof activityData !== 'object' || Array.isArray(activityData) || typeof isPublic !== 'boolean') {
                return sendValidationError(res, 'Invalid activity');
            }

            const activity = await this.activityModel.create(req.user.id, activityType, activityData, isPublic);
            res.status(201).json(activity);
        } catch (error) {
            return handleServerError(res, error, 'activities:create');
        }
    }

    async deleteActivity(req, res) {
        try {
            const activityId = positiveInt(req.params.id);
            if (!activityId) return sendValidationError(res, 'Invalid activity id');
            const deleted = await this.activityModel.delete(activityId, req.user.id);
            if (!deleted) return res.status(404).json({ error: 'Activity not found' });
            res.json({ message: 'Activity deleted successfully' });
        } catch (error) {
            return handleServerError(res, error, 'activities:delete');
        }
    }
}

module.exports = ActivityController;
