// Message Controller
const Message = require('../models/Message');

class MessageController {
    constructor(pool) {
        this.messageModel = new Message(pool);
    }

    async sendMessage(req, res) {
        try {
            const senderId = req.user.id;
            const { recipientId, subject, content } = req.body;
            
            const message = await this.messageModel.send(senderId, recipientId, subject, content);
            res.status(201).json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getInbox(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            
            const messages = await this.messageModel.getInbox(userId, limit);
            const unreadCount = await this.messageModel.getUnreadCount(userId);
            
            res.json({
                messages,
                unreadCount
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSent(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            
            const messages = await this.messageModel.getSent(userId, limit);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const messageId = req.params.id;
            
            const message = await this.messageModel.markAsRead(messageId, userId);
            res.json(message);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteMessage(req, res) {
        try {
            const userId = req.user.id;
            const messageId = req.params.id;
            
            await this.messageModel.delete(messageId, userId);
            res.json({ message: 'Message deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = MessageController;
