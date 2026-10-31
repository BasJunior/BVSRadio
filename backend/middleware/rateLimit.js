// Lightweight in-process rate limiter.
// Production deployments with more than one instance should also use a shared
// store/provider-level limiter (for example Redis or the hosting edge/WAF).
const requestCounts = new Map();
const MAX_TRACKED_CLIENTS = 50_000;

const rateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Too many requests, please try again later.'
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;

        let requests = requestCounts.get(key) || [];
        requests = requests.filter((time) => time > windowStart);

        if (requests.length >= max) {
            const retryAfterSeconds = Math.max(1, Math.ceil((requests[0] + windowMs - now) / 1000));
            res.set('Retry-After', String(retryAfterSeconds));
            res.set('RateLimit-Limit', String(max));
            res.set('RateLimit-Remaining', '0');
            return res.status(429).json({ error: message });
        }

        requests.push(now);
        requestCounts.set(key, requests);
        res.set('RateLimit-Limit', String(max));
        res.set('RateLimit-Remaining', String(Math.max(0, max - requests.length)));

        // Bound memory use. Expire inactive keys first; if an attacker still
        // creates excessive unique keys, evict oldest map entries.
        if (requestCounts.size > MAX_TRACKED_CLIENTS) {
            for (const [clientKey, timestamps] of requestCounts.entries()) {
                if (!timestamps.some((time) => time > windowStart)) requestCounts.delete(clientKey);
            }
            while (requestCounts.size > MAX_TRACKED_CLIENTS) {
                const oldestKey = requestCounts.keys().next().value;
                requestCounts.delete(oldestKey);
            }
        }

        next();
    };
};

module.exports = rateLimit;
