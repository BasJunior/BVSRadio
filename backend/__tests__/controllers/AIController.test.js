// AI Controller Tests
const AIController = require('../../controllers/AIController');
const Conversation = require('../../models/Conversation');

// Mock OpenAI
jest.mock('openai');
const OpenAI = require('openai');

// Mock the Conversation model
jest.mock('../../models/Conversation');

describe('AIController', () => {
    let aiController;
    let mockPool;
    let mockReq;
    let mockRes;
    let mockOpenAI;

    beforeEach(() => {
        // Setup mock pool
        mockPool = {
            query: jest.fn()
        };

        // Setup mock request and response
        mockReq = {
            user: { id: 1 },
            body: {},
            query: {}
        };

        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        // Setup mock OpenAI
        mockOpenAI = {
            chat: {
                completions: {
                    create: jest.fn()
                }
            }
        };

        OpenAI.mockImplementation(() => mockOpenAI);

        // Set environment variable for testing
        process.env.OPENAI_API_KEY = 'test-api-key';

        aiController = new AIController(mockPool);

        // Mock conversation model methods
        Conversation.mockImplementation(() => ({
            create: jest.fn().mockResolvedValue({ id: 1 }),
            getHistory: jest.fn().mockResolvedValue([]),
            deleteHistory: jest.fn().mockResolvedValue({ message: 'Deleted' })
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('chat', () => {
        it('should return 400 if message is empty', async () => {
            mockReq.body = { message: '' };

            await aiController.chat(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Message is required'
            });
        });

        it('should return 503 if OpenAI is not configured', async () => {
            // Create controller without API key
            delete process.env.OPENAI_API_KEY;
            const controller = new AIController(mockPool);
            mockReq.body = { message: 'Hello' };

            await controller.chat(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(503);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('not configured')
                })
            );
        });

        it('should successfully process a chat message', async () => {
            mockReq.body = { 
                message: 'Hello, AI!',
                context: { page: '/shop' }
            };

            const mockResponse = {
                choices: [{
                    message: {
                        content: 'Hello! How can I help you today?'
                    }
                }]
            };

            mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

            await aiController.chat(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    response: 'Hello! How can I help you today?',
                    disclaimer: expect.any(String)
                })
            );
        });

        it('should handle OpenAI API errors gracefully', async () => {
            mockReq.body = { message: 'Test message' };

            mockOpenAI.chat.completions.create.mockRejectedValue(
                new Error('API Error')
            );

            await aiController.chat(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(String),
                    fallback: expect.any(String)
                })
            );
        });

        it('should include conversation history in the request', async () => {
            mockReq.body = { message: 'Follow-up question' };

            const mockHistory = [
                { role: 'user', message: 'Previous question' },
                { role: 'assistant', message: 'Previous answer' }
            ];

            aiController.conversationModel.getHistory = jest.fn().mockResolvedValue(mockHistory);

            mockOpenAI.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: 'Response' } }]
            });

            await aiController.chat(mockReq, mockRes);

            expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        expect.objectContaining({ role: 'system' }),
                        expect.objectContaining({ role: 'user', content: 'Previous question' }),
                        expect.objectContaining({ role: 'assistant', content: 'Previous answer' })
                    ])
                })
            );
        });
    });

    describe('getHistory', () => {
        it('should retrieve conversation history', async () => {
            const mockHistory = [
                { id: 1, user_id: 1, message: 'Test', role: 'user', created_at: new Date() }
            ];

            aiController.conversationModel.getHistory = jest.fn().mockResolvedValue(mockHistory);

            await aiController.getHistory(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                history: mockHistory
            });
        });

        it('should use custom limit from query parameter', async () => {
            mockReq.query = { limit: '50' };

            aiController.conversationModel.getHistory = jest.fn().mockResolvedValue([]);

            await aiController.getHistory(mockReq, mockRes);

            expect(aiController.conversationModel.getHistory).toHaveBeenCalledWith(1, 50);
        });

        it('should handle errors when retrieving history', async () => {
            aiController.conversationModel.getHistory = jest.fn().mockRejectedValue(
                new Error('Database error')
            );

            await aiController.getHistory(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe('clearHistory', () => {
        it('should clear conversation history', async () => {
            aiController.conversationModel.deleteHistory = jest.fn().mockResolvedValue({
                message: 'Conversation history deleted'
            });

            await aiController.clearHistory(mockReq, mockRes);

            expect(aiController.conversationModel.deleteHistory).toHaveBeenCalledWith(1);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Conversation history cleared successfully'
            });
        });

        it('should handle errors when clearing history', async () => {
            aiController.conversationModel.deleteHistory = jest.fn().mockRejectedValue(
                new Error('Delete failed')
            );

            await aiController.clearHistory(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe('suggest', () => {
        it('should return 503 if OpenAI is not configured', async () => {
            delete process.env.OPENAI_API_KEY;
            const controller = new AIController(mockPool);
            mockReq.body = { type: 'products', data: {} };

            await controller.suggest(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(503);
        });

        it('should return 400 for invalid suggestion type', async () => {
            mockReq.body = { type: 'invalid', data: {} };

            await aiController.suggest(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Invalid suggestion type'
            });
        });

        it('should generate product suggestions', async () => {
            mockReq.body = {
                type: 'products',
                data: { current_product: 'Headphones' }
            };

            mockOpenAI.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: 'Suggested products...' } }]
            });

            await aiController.suggest(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                suggestions: 'Suggested products...',
                type: 'products'
            });
        });

        it('should generate playlist suggestions', async () => {
            mockReq.body = {
                type: 'playlists',
                data: { current_genre: 'Rock' }
            };

            mockOpenAI.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: 'Playlist suggestions...' } }]
            });

            await aiController.suggest(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                suggestions: 'Playlist suggestions...',
                type: 'playlists'
            });
        });

        it('should handle errors in suggestion generation', async () => {
            mockReq.body = { type: 'products', data: {} };

            mockOpenAI.chat.completions.create.mockRejectedValue(
                new Error('API Error')
            );

            await aiController.suggest(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getSystemPrompt', () => {
        it('should return a system prompt', () => {
            const prompt = aiController.getSystemPrompt();

            expect(prompt).toContain('BVSRadio');
            expect(prompt).toContain('E-commerce');
            expect(prompt).toContain('Audio Streaming');
            expect(prompt).toContain('Social Features');
        });
    });
});
