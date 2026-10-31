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

function verifyBearerToken(header) {
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.slice(7).trim();
    if (!token) return null;

    const payload = jwt.verify(token, getJwtSecret(), {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'bvsradio',
        audience: process.env.JWT_AUDIENCE || 'bvsradio-api',
        clockTolerance: 5
    });

    const id = Number.parseInt(payload.sub, 10);
    if (!Number.isSafeInteger(id) || id <= 0 || !Number.isFinite(payload.exp)) {
        throw new Error('Invalid authentication token');
    }

    return {
        id,
        role: typeof payload.role === 'string' ? payload.role : 'user'
    };
}

function authMiddleware(req, res, next) {
    try {
        const user = verifyBearerToken(req.get('authorization'));
        if (!user) return res.status(401).json({ error: 'Authentication required' });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
}

function optionalAuthMiddleware(req, res, next) {
    const header = req.get('authorization');
    if (!header) return next();
    try {
        const user = verifyBearerToken(header);
        if (!user) return res.status(401).json({ error: 'Invalid authentication token' });
        req.user = user;
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
    optionalAuthMiddleware,
    requireRole
};
