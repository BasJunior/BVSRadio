// AI Controller - handles AI assistant interactions
const OpenAI = require('openai');
const Conversation = require('../models/Conversation');

class AIController {
    constructor(pool) {
        this.conversationModel = new Conversation(pool);
        this.pool = pool;
        
        // Initialize OpenAI client
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn('WARNING: OPENAI_API_KEY not set. AI assistant will not function properly.');
        }
        this.openai = apiKey ? new OpenAI({ apiKey }) : null;
    }

    // System prompt that defines the AI assistant's behavior
    getSystemPrompt() {
        return `You are a helpful AI assistant for BVSRadio, a platform that combines audio streaming, e-commerce, and social features.

Your capabilities include:
1. **E-commerce Support**: Help users find products, manage their cart, track orders, and answer product questions.
2. **Audio Streaming**: Provide information about tracks, playlists, radio stations, and suggest music based on preferences.
3. **Social Features**: Assist with profiles, messaging, followers, and activity feeds.

Guidelines:
- Be concise, friendly, and helpful
- If you don't have specific information, offer to help the user find it or direct them to the appropriate feature
- Protect user privacy - never share sensitive data
- When unsure, acknowledge limitations and suggest alternatives
- Use context from conversation history to provide personalized responses

Remember: This is an AI assistant. Always be transparent about your limitations.`;
    }

    async chat(req, res) {
        try {
            const userId = req.user.id;
            const { message, context } = req.body;

            if (!message || message.trim().length === 0) {
                return res.status(400).json({ error: 'Message is required' });
            }

            // Check if OpenAI is configured
            if (!this.openai) {
                return res.status(503).json({ 
                    error: 'AI assistant is not configured. Please set OPENAI_API_KEY environment variable.',
                    fallback: 'Please contact support or browse our help documentation.'
                });
            }

            // Save user message to conversation history
            await this.conversationModel.create(userId, message, 'user');

            // Get conversation history for context
            const history = await this.conversationModel.getHistory(userId, 10);

            // Build messages array for OpenAI
            const messages = [
                { role: 'system', content: this.getSystemPrompt() }
            ];

            // Add context if provided (e.g., current page, user data)
            if (context) {
                const contextMessage = `Current context: ${JSON.stringify(context)}`;
                messages.push({ role: 'system', content: contextMessage });
            }

            // Add conversation history
            history.forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.message
                });
            });

            // Get AI response
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            const aiResponse = completion.choices[0].message.content;

            // Save AI response to conversation history
            await this.conversationModel.create(userId, aiResponse, 'assistant');

            res.json({
                response: aiResponse,
                conversationId: history.length + 2,
                disclaimer: 'This response is AI-generated and may not always be accurate. Please verify important information.'
            });

        } catch (error) {
            console.error('AI Chat Error:', error);
            
            // Provide helpful fallback response
            res.status(500).json({
                error: 'Unable to process your request at this time',
                fallback: 'You can try: browsing products, checking your cart, viewing playlists, or contacting support.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 20;
            
            const history = await this.conversationModel.getHistory(userId, limit);
            res.json({ history });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async clearHistory(req, res) {
        try {
            const userId = req.user.id;
            await this.conversationModel.deleteHistory(userId);
            res.json({ message: 'Conversation history cleared successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async suggest(req, res) {
        try {
            const userId = req.user.id;
            const { type, data } = req.body;

            if (!this.openai) {
                return res.status(503).json({ 
                    error: 'AI assistant is not configured'
                });
            }

            let prompt = '';
            
            // Generate context-aware suggestions based on type
            switch (type) {
                case 'products':
                    prompt = `Based on the following product data, suggest 3-5 related products or categories that the user might be interested in: ${JSON.stringify(data)}`;
                    break;
                case 'playlists':
                    prompt = `Based on the following playlist/track data, suggest similar music or create a playlist suggestion: ${JSON.stringify(data)}`;
                    break;
                case 'activities':
                    prompt = `Based on the user's activity data, provide personalized recommendations: ${JSON.stringify(data)}`;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid suggestion type' });
            }

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: this.getSystemPrompt() },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 300,
                temperature: 0.8,
            });

            res.json({
                suggestions: completion.choices[0].message.content,
                type: type
            });

        } catch (error) {
            console.error('AI Suggestion Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AIController;
