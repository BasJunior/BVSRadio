// Main server application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const dbConfig = require('./config/database');

// Controllers
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const CartController = require('./controllers/CartController');
const PlaylistController = require('./controllers/PlaylistController');
const MessageController = require('./controllers/MessageController');
const ActivityController = require('./controllers/ActivityController');

const app = express();
const pool = new Pool(dbConfig);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize controllers
const userController = new UserController(pool);
const productController = new ProductController(pool);
const cartController = new CartController(pool);
const playlistController = new PlaylistController(pool);
const messageController = new MessageController(pool);
const activityController = new ActivityController(pool);

// Authentication middleware (simplified - needs proper JWT implementation)
const authMiddleware = (req, res, next) => {
    // In production, verify JWT token here
    // For now, mock authentication
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.user = { id: parseInt(userId) };
    next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BVSRadio API is running' });
});

// User routes
app.get('/api/users/:id', userController.getProfile.bind(userController));
app.put('/api/users/profile', authMiddleware, userController.updateProfile.bind(userController));
app.get('/api/users/:id/followers', userController.getFollowers.bind(userController));
app.get('/api/users/:id/following', userController.getFollowing.bind(userController));
app.post('/api/users/:id/follow', authMiddleware, userController.follow.bind(userController));
app.delete('/api/users/:id/follow', authMiddleware, userController.unfollow.bind(userController));

// Product routes
app.get('/api/products', productController.getAllProducts.bind(productController));
app.get('/api/products/:id', productController.getProduct.bind(productController));
app.post('/api/products', authMiddleware, productController.createProduct.bind(productController));
app.put('/api/products/:id', authMiddleware, productController.updateProduct.bind(productController));
app.delete('/api/products/:id', authMiddleware, productController.deleteProduct.bind(productController));

// Shopping cart routes
app.get('/api/cart', authMiddleware, cartController.getCart.bind(cartController));
app.post('/api/cart', authMiddleware, cartController.addToCart.bind(cartController));
app.put('/api/cart', authMiddleware, cartController.updateCartItem.bind(cartController));
app.delete('/api/cart/:productId', authMiddleware, cartController.removeFromCart.bind(cartController));
app.delete('/api/cart', authMiddleware, cartController.clearCart.bind(cartController));
app.post('/api/cart/checkout', authMiddleware, cartController.checkout.bind(cartController));

// Playlist routes
app.get('/api/playlists/public', playlistController.getPublicPlaylists.bind(playlistController));
app.get('/api/playlists/:id', playlistController.getPlaylist.bind(playlistController));
app.get('/api/users/:userId/playlists', playlistController.getUserPlaylists.bind(playlistController));
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

// Radio streaming endpoints (placeholder - needs real streaming implementation)
app.get('/api/stations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM radio_stations WHERE is_active = true');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/stations/:id/stream', (req, res) => {
    // In production, this would proxy to actual radio stream
    res.json({ 
        message: 'Stream endpoint',
        station_id: req.params.id,
        stream_url: `http://stream.bvsradio.com/station/${req.params.id}`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BVSRadio API server running on port ${PORT}`);
});

module.exports = app;
