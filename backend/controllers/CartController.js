// Shopping Cart Controller
const ShoppingCart = require('../models/ShoppingCart');

class CartController {
    constructor(pool) {
        this.cartModel = new ShoppingCart(pool);
    }

    async getCart(req, res) {
        try {
            const userId = req.user.id;
            const items = await this.cartModel.getItems(userId);
            const total = await this.cartModel.getTotalAmount(userId);
            
            res.json({
                items,
                total
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            
            const item = await this.cartModel.addItem(userId, productId, quantity);
            res.status(201).json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateCartItem(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body;
            
            const item = await this.cartModel.updateItemQuantity(userId, productId, quantity);
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async removeFromCart(req, res) {
        try {
            const userId = req.user.id;
            const productId = req.params.productId;
            
            await this.cartModel.removeItem(userId, productId);
            res.json({ message: 'Item removed from cart' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async clearCart(req, res) {
        try {
            const userId = req.user.id;
            await this.cartModel.clear(userId);
            res.json({ message: 'Cart cleared' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async checkout(req, res) {
        try {
            const userId = req.user.id;
            const { shipping_address, payment_method } = req.body;
            
            // Get cart items and total
            const items = await this.cartModel.getItems(userId);
            const total = await this.cartModel.getTotalAmount(userId);
            
            if (items.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }
            
            // Create order (simplified - would need proper order processing)
            const orderQuery = `
                INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
                VALUES ($1, $2, $3, $4, 'pending')
                RETURNING *
            `;
            const orderResult = await this.cartModel.pool.query(orderQuery, [userId, total, shipping_address, payment_method]);
            const order = orderResult.rows[0];
            
            // Add order items
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES ($1, $2, $3, $4)
                `;
                await this.cartModel.pool.query(itemQuery, [order.id, item.product_id, item.quantity, item.price]);
            }
            
            // Clear cart
            await this.cartModel.clear(userId);
            
            res.json({
                message: 'Order placed successfully',
                order
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CartController;
