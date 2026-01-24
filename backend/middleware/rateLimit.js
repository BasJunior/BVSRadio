// Rate limiting middleware
// Simple in-memory rate limiter (use Redis in production)

const requestCounts = new Map();

const rateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // max requests per window
        message = 'Too many requests, please try again later.'
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Get or create request history for this IP
        if (!requestCounts.has(key)) {
            requestCounts.set(key, []);
        }
        
        const requests = requestCounts.get(key);
        
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < windowMs);
        
        // Check if limit exceeded
        if (validRequests.length >= max) {
            return res.status(429).json({ error: message });
        }
        
        // Add current request
        validRequests.push(now);
        requestCounts.set(key, validRequests);
        
        // Clean up old entries periodically
        if (Math.random() < 0.01) { // 1% chance to clean up
            for (const [k, v] of requestCounts.entries()) {
                const valid = v.filter(time => now - time < windowMs);
                if (valid.length === 0) {
                    requestCounts.delete(k);
                } else {
                    requestCounts.set(k, valid);
                }
            }
        }
        
        next();
    };
};

module.exports = rateLimit;
