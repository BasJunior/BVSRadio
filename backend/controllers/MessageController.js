// Message Controller
const Message = require('../models/Message');
const { positiveInt, boundedInt, cleanString, sendValidationError } = require('../middleware/validation');
const { handleServerError } = require('../utils/http');

class MessageController {
    constructor(pool) {
        this.messageModel = new Message(pool);
    }

    async sendMessage(req, res) {
        try {
            const recipientId = positiveInt(req.body.recipientId);
            const subject = cleanString(req.body.subject, { max: 200 });
            const content = cleanString(req.body.content, { min: 1, max: 5000, required: true });
            if (!recipientId || subject === null || content === null) {
                return sendValidationError(res, 'Invalid message');
            }
            if (recipientId === req.user.id) {
                return res.status(400).json({ error: 'Cannot message yourself' });
            }

            const message = await this.messageModel.send(req.user.id, recipientId, subject, content);
            res.status(201).json(message);
        } catch (error) {
            return handleServerError(res, error, 'messages:send');
        }
    }

    async getInbox(req, res) {
        try {
            const limit = boundedInt(req.query.limit ?? 50, { min: 1, max: 100 });
            if (!limit) return sendValidationError(res, 'Invalid limit');
            const messages = await this.messageModel.getInbox(req.user.id, limit);
            const unreadCount = await this.messageModel.getUnreadCount(req.user.id);
            res.json({ messages, unreadCount });
        } catch (error) {
            return handleServerError(res, error, 'messages:inbox');
        }
    }

    async getSent(req, res) {
        try {
            const limit = boundedInt(req.query.limit ?? 50, { min: 1, max: 100 });
            if (!limit) return sendValidationError(res, 'Invalid limit');
            const messages = await this.messageModel.getSent(req.user.id, limit);
            res.json(messages);
        } catch (error) {
            return handleServerError(res, error, 'messages:sent');
        }
    }

    async markAsRead(req, res) {
        try {
            const messageId = positiveInt(req.params.id);
            if (!messageId) return sendValidationError(res, 'Invalid message id');
            const message = await this.messageModel.markAsRead(messageId, req.user.id);
            if (!message) return res.status(404).json({ error: 'Message not found' });
            res.json(message);
        } catch (error) {
            return handleServerError(res, error, 'messages:mark-read');
        }
    }

    async deleteMessage(req, res) {
        try {
            const messageId = positiveInt(req.params.id);
            if (!messageId) return sendValidationError(res, 'Invalid message id');
            const deleted = await this.messageModel.delete(messageId, req.user.id);
            if (!deleted) return res.status(404).json({ error: 'Message not found' });
            res.json({ message: 'Message deleted successfully' });
        } catch (error) {
            return handleServerError(res, error, 'messages:delete');
        }
    }
}

module.exports = MessageController;
