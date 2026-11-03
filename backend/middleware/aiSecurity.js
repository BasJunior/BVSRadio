// Security middleware for AI assistant requests
const validator = require('validator');

// Sanitize user input to prevent injection attacks
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    // Remove potentially harmful characters while preserving meaningful content
    let sanitized = input.trim();
    
    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);
    
    // Limit length to prevent abuse
    const MAX_INPUT_LENGTH = 2000;
    if (sanitized.length > MAX_INPUT_LENGTH) {
        sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
    }
    
    return sanitized;
}

// Content filter to detect potentially sensitive information
function containsSensitiveData(text) {
    // Check for common patterns of sensitive data
    const patterns = [
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/i, // Credit card numbers
        /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/i, // SSN
        /password\s*[=:]\s*\S+/i, // Password patterns
        /api[_-]?key\s*[=:]\s*\S+/i, // API keys
        /secret\s*[=:]\s*\S+/i, // Secret keys
    ];
    
    return patterns.some(pattern => pattern.test(text));
}

// Middleware to validate and sanitize AI requests
function aiSecurityMiddleware(req, res, next) {
    try {
        const { message, context } = req.body;
        
        // Validate message exists
        if (!message) {
            return res.status(400).json({
                error: 'Message is required',
                fallback: 'Please provide a message to send to the AI assistant.'
            });
        }
        
        // Sanitize the message
        const sanitizedMessage = sanitizeInput(message);
        
        if (!sanitizedMessage || sanitizedMessage.length === 0) {
            return res.status(400).json({
                error: 'Message cannot be empty after sanitization',
                fallback: 'Please provide a valid message.'
            });
        }
        
        // Check for sensitive data
        if (containsSensitiveData(sanitizedMessage)) {
            return res.status(400).json({
                error: 'Message contains potentially sensitive information',
                fallback: 'Please do not share credit card numbers, passwords, or other sensitive data with the AI assistant.'
            });
        }
        
        // Replace original message with sanitized version
        req.body.message = sanitizedMessage;
        
        // Sanitize context if provided
        if (context) {
            if (typeof context === 'object') {
                // Sanitize string values in context object
                Object.keys(context).forEach(key => {
                    if (typeof context[key] === 'string') {
                        context[key] = sanitizeInput(context[key]);
                    }
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('AI Security Middleware Error:', error);
        return res.status(500).json({
            error: 'Security validation failed',
            fallback: 'Unable to process your request. Please try again.'
        });
    }
}

// Rate limiting specifically for AI endpoints (stricter than general API)
function aiRateLimitMiddleware(req, res, next) {
    // Use existing rate limit middleware but with stricter limits
    // This is a placeholder - in production, implement token bucket or similar
    const limit = 20; // 20 requests per window
    const windowMs = 60 * 1000; // 1 minute
    
    // Note: This is simplified. In production, use a proper rate limiting library
    // or integrate with Redis for distributed rate limiting
    
    next();
}

module.exports = {
    sanitizeInput,
    containsSensitiveData,
    aiSecurityMiddleware,
    aiRateLimitMiddleware
};
