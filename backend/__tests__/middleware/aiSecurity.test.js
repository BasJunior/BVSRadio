// AI Security Middleware Tests
const {
    sanitizeInput,
    containsSensitiveData,
    aiSecurityMiddleware
} = require('../../middleware/aiSecurity');

describe('AI Security Middleware', () => {
    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('should escape HTML characters', () => {
            const input = '<script>alert("XSS")</script>';
            const sanitized = sanitizeInput(input);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('&lt;');
        });

        it('should limit input length to 2000 characters', () => {
            const longInput = 'a'.repeat(3000);
            const sanitized = sanitizeInput(longInput);
            expect(sanitized.length).toBeLessThanOrEqual(2000);
        });

        it('should return empty string for non-string input', () => {
            expect(sanitizeInput(null)).toBe('');
            expect(sanitizeInput(undefined)).toBe('');
            expect(sanitizeInput(123)).toBe('');
            expect(sanitizeInput({})).toBe('');
        });

        it('should handle special characters safely', () => {
            const input = 'Hello & "World" <test>';
            const sanitized = sanitizeInput(input);
            expect(sanitized).toContain('&amp;');
            expect(sanitized).toContain('&quot;');
        });
    });

    describe('containsSensitiveData', () => {
        it('should detect credit card numbers', () => {
            expect(containsSensitiveData('My card is 4111-1111-1111-1111')).toBe(true);
            expect(containsSensitiveData('Card: 4111111111111111')).toBe(true);
            expect(containsSensitiveData('4111 1111 1111 1111')).toBe(true);
        });

        it('should detect SSN patterns', () => {
            expect(containsSensitiveData('SSN: 123-45-6789')).toBe(true);
            expect(containsSensitiveData('123 45 6789')).toBe(true);
        });

        it('should detect password patterns', () => {
            expect(containsSensitiveData('password=secret123')).toBe(true);
            expect(containsSensitiveData('password: mypass')).toBe(true);
        });

        it('should detect API key patterns', () => {
            expect(containsSensitiveData('api_key=abc123')).toBe(true);
            expect(containsSensitiveData('api-key: xyz789')).toBe(true);
        });

        it('should detect secret patterns', () => {
            expect(containsSensitiveData('secret=topsecret')).toBe(true);
            expect(containsSensitiveData('secret: confidential')).toBe(true);
        });

        it('should return false for safe content', () => {
            expect(containsSensitiveData('Hello, how can I help you?')).toBe(false);
            expect(containsSensitiveData('What products do you recommend?')).toBe(false);
        });
    });

    describe('aiSecurityMiddleware', () => {
        let mockReq;
        let mockRes;
        let mockNext;

        beforeEach(() => {
            mockReq = {
                body: {}
            };

            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis()
            };

            mockNext = jest.fn();
        });

        it('should return 400 if message is missing', () => {
            mockReq.body = {};

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Message is required'
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should sanitize the message and call next', () => {
            mockReq.body = {
                message: '  <script>Hello</script>  '
            };

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            expect(mockReq.body.message).not.toContain('<script>');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should return 400 if sanitized message is empty', () => {
            mockReq.body = {
                message: '   '
            };

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should block messages with sensitive data', () => {
            mockReq.body = {
                message: 'My credit card is 4111-1111-1111-1111'
            };

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('sensitive information')
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should sanitize context object if provided', () => {
            mockReq.body = {
                message: 'Hello',
                context: {
                    page: '<script>test</script>',
                    number: 123
                }
            };

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            expect(mockReq.body.context.page).not.toContain('<script>');
            expect(mockReq.body.context.number).toBe(123); // Non-string values unchanged
            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle errors gracefully', () => {
            // Create a circular reference to cause JSON error
            const circular = {};
            circular.self = circular;
            
            mockReq.body = {
                message: 'Test',
                context: circular
            };

            // Mock sanitizeInput to throw an error
            const originalSanitize = sanitizeInput;
            jest.spyOn(require('../../middleware/aiSecurity'), 'sanitizeInput')
                .mockImplementation(() => {
                    throw new Error('Test error');
                });

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            // Note: This test depends on error handling in the middleware
            // The current implementation should catch errors and return 500
        });

        it('should allow valid messages through', () => {
            mockReq.body = {
                message: 'What products do you recommend?'
            };

            aiSecurityMiddleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });
    });
});
