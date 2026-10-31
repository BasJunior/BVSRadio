// Authentication and authorization helpers
const jwt = require('jsonwebtoken');

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 characters');
    }
    return secret;
}

// Fail closed at startup instead of silently serving an unauthenticated production API.
if (process.env.NODE_ENV === 'production') {
    getJwtSecret();
}

function authMiddleware(req, res, next) {
    const header = req.get('authorization');
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.slice(7).trim();
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, getJwtSecret(), {
            algorithms: ['HS256'],
            issuer: process.env.JWT_ISSUER || 'bvsradio',
            audience: process.env.JWT_AUDIENCE || 'bvsradio-api',
            clockTolerance: 5
        });

        const id = Number.parseInt(payload.sub, 10);
        if (!Number.isSafeInteger(id) || id <= 0 || !Number.isFinite(payload.exp)) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        req.user = {
            id,
            role: typeof payload.role === 'string' ? payload.role : 'user'
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole
};
