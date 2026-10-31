// Main server application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const dbConfig = require('./config/database');
const rateLimit = require('./middleware/rateLimit');
const { authMiddleware, requireRole } = require('./middleware/auth');
const { positiveInt } = require('./middleware/validation');

// Controllers
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const CartController = require('./controllers/CartController');
const PlaylistController = require('./controllers/PlaylistController');
const MessageController = require('./controllers/MessageController');
const ActivityController = require('./controllers/ActivityController');

const app = express();
const pool = new Pool(dbConfig);

app.disable('x-powered-by');

const trustProxy = Number.parseInt(process.env.TRUST_PROXY || '0', 10);
if (Number.isSafeInteger(trustProxy) && trustProxy > 0) {
    app.set('trust proxy', trustProxy);
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://bvsradio.com,https://www.bvsradio.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' }
}));
app.use(cors({
    origin(origin, callback) {
        // Allow server-to-server requests without an Origin header.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 600
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// Rate limiting - apply to all API routes. For multi-instance production,
// configure an external/shared rate-limiting layer as well.
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// Initialize controllers
const userController = new UserController(pool);
const productController = new ProductController(pool);
const cartController = new CartController(pool);
const playlistController = new PlaylistController(pool);
const messageController = new MessageController(pool);
const activityController = new ActivityController(pool);

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// User routes. Put fixed paths before /:id.
app.get('/api/users/me', authMiddleware, userController.getMe.bind(userController));
app.put('/api/users/profile', authMiddleware, userController.updateProfile.bind(userController));
app.get('/api/users/:id/followers', userController.getFollowers.bind(userController));
app.get('/api/users/:id/following', userController.getFollowing.bind(userController));
app.post('/api/users/:id/follow', authMiddleware, userController.follow.bind(userController));
app.delete('/api/users/:id/follow', authMiddleware, userController.unfollow.bind(userController));
app.get('/api/users/:id', userController.getProfile.bind(userController));

// Product routes. Mutations are admin-only.
app.get('/api/products', productController.getAllProducts.bind(productController));
app.get('/api/products/:id', productController.getProduct.bind(productController));
app.post('/api/products', authMiddleware, requireRole('admin'), productController.createProduct.bind(productController));
app.put('/api/products/:id', authMiddleware, requireRole('admin'), productController.updateProduct.bind(productController));
app.delete('/api/products/:id', authMiddleware, requireRole('admin'), productController.deleteProduct.bind(productController));

// Shopping cart routes
app.get('/api/cart', authMiddleware, cartController.getCart.bind(cartController));
app.post('/api/cart', authMiddleware, cartController.addToCart.bind(cartController));
app.put('/api/cart', authMiddleware, cartController.updateCartItem.bind(cartController));
app.delete('/api/cart/:productId', authMiddleware, cartController.removeFromCart.bind(cartController));
app.delete('/api/cart', authMiddleware, cartController.clearCart.bind(cartController));
app.post('/api/cart/checkout', authMiddleware, cartController.checkout.bind(cartController));

// Playlist routes. Public endpoints never expose private playlists.
app.get('/api/playlists/public', playlistController.getPublicPlaylists.bind(playlistController));
app.get('/api/playlists/mine', authMiddleware, playlistController.getMyPlaylists.bind(playlistController));
app.get('/api/users/:userId/playlists', playlistController.getUserPlaylists.bind(playlistController));
app.get('/api/playlists/:id', playlistController.getPlaylist.bind(playlistController));
app.post('/api/playlists', authMiddleware, playlistController.createPlaylist.bind(playlistController));
app.put('/api/playlists/:id', authMiddleware, playlistController.updatePlaylist.bind(playlistController));
app.delete('/api/playlists/:id', authMiddleware, playlistController.deletePlaylist.bind(playlistController));
app.post('/api/playlists/tracks', authMiddleware, playlistController.addTrack.bind(playlistController));
app.delete('/api/playlists/:playlistId/tracks/:trackId', authMiddleware, playlistController.removeTrack.bind(playlistController));

// Message routes
app.get('/api/messages/inbox', authMiddleware, messageController.getInbox.bind(messageController));
app.get('/api/messages/sent', authMiddleware, messageController.getSent.bind(messageController));
app.post('/api/messages', authMiddleware, messageController.sendMessage.bind(messageController));
app.put('/api/messages/:id/read', authMiddleware, messageController.markAsRead.bind(messageController));
app.delete('/api/messages/:id', authMiddleware, messageController.deleteMessage.bind(messageController));

// Activity feed routes
app.get('/api/feed', activityController.getFeed.bind(activityController));
app.get('/api/users/:userId/activities', activityController.getUserActivities.bind(activityController));
app.post('/api/activities', authMiddleware, activityController.createActivity.bind(activityController));
app.delete('/api/activities/:id', authMiddleware, activityController.deleteActivity.bind(activityController));

// Radio streaming endpoints
app.get('/api/stations', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description, logo_url, stream_url FROM radio_stations WHERE is_active = true'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('[stations:list]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/stations/:id/stream', (req, res) => {
    const stationId = positiveInt(req.params.id);
    if (!stationId) return res.status(400).json({ error: 'Invalid station id' });

    res.json({
        message: 'Stream endpoint',
        station_id: stationId,
        stream_url: `https://stream.bvsradio.com/station/${stationId}`
    });
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[unhandled]', err);
    if (err && err.message === 'Origin not allowed by CORS') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const server = app.listen(PORT, () => {
    console.log(`BVSRadio API server running on port ${PORT}`);
});
server.requestTimeout = 30_000;
server.headersTimeout = 35_000;

module.exports = app;
