// Shopping Cart Controller
const ShoppingCart = require('../models/ShoppingCart');
const Order = require('../models/Order');
const { positiveInt, boundedInt, cleanString, sendValidationError } = require('../middleware/validation');
const { handleServerError } = require('../utils/http');

class CartController {
    constructor(pool) {
        this.cartModel = new ShoppingCart(pool);
        this.orderModel = new Order(pool);
    }

    async getCart(req, res) {
        try {
            const items = await this.cartModel.getItems(req.user.id);
            const total = await this.cartModel.getTotalAmount(req.user.id);
            res.json({ items, total });
        } catch (error) {
            return handleServerError(res, error, 'cart:get');
        }
    }

    async addToCart(req, res) {
        try {
            const productId = positiveInt(req.body.productId);
            const quantity = boundedInt(req.body.quantity ?? 1, { min: 1, max: 100 });
            if (!productId || !quantity) return sendValidationError(res, 'Invalid product or quantity');

            const item = await this.cartModel.addItem(req.user.id, productId, quantity);
            res.status(201).json(item);
        } catch (error) {
            return handleServerError(res, error, 'cart:add');
        }
    }

    async updateCartItem(req, res) {
        try {
            const productId = positiveInt(req.body.productId);
            const quantity = boundedInt(req.body.quantity, { min: 1, max: 100 });
            if (!productId || !quantity) return sendValidationError(res, 'Invalid product or quantity');

            const item = await this.cartModel.updateItemQuantity(req.user.id, productId, quantity);
            if (!item) return res.status(404).json({ error: 'Cart item not found' });
            res.json(item);
        } catch (error) {
            return handleServerError(res, error, 'cart:update');
        }
    }

    async removeFromCart(req, res) {
        try {
            const productId = positiveInt(req.params.productId);
            if (!productId) return sendValidationError(res, 'Invalid product id');
            await this.cartModel.removeItem(req.user.id, productId);
            res.json({ message: 'Item removed from cart' });
        } catch (error) {
            return handleServerError(res, error, 'cart:remove');
        }
    }

    async clearCart(req, res) {
        try {
            await this.cartModel.clear(req.user.id);
            res.json({ message: 'Cart cleared' });
        } catch (error) {
            return handleServerError(res, error, 'cart:clear');
        }
    }

    async checkout(req, res) {
        try {
            const shippingAddress = cleanString(req.body.shipping_address, { min: 5, max: 1000, required: true });
            const paymentMethod = cleanString(req.body.payment_method, { min: 1, max: 50, required: true });
            if (!shippingAddress || !paymentMethod) return sendValidationError(res, 'Invalid checkout details');

            // payment_method must be a provider identifier (for example "stripe"), never raw card data.
            if (!/^[a-z0-9_-]+$/i.test(paymentMethod)) {
                return sendValidationError(res, 'Invalid payment method');
            }

            const items = await this.cartModel.getItems(req.user.id);
            const total = await this.cartModel.getTotalAmount(req.user.id);
            if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

            // This creates a pending order only. Payment confirmation must happen through
            // the payment provider's verified server-side callback/webhook before fulfillment.
            const order = await this.orderModel.create(req.user.id, {
                total_amount: total,
                shipping_address: shippingAddress,
                payment_method: paymentMethod
            });
            await this.orderModel.addOrderItems(order.id, items);
            await this.cartModel.clear(req.user.id);

            res.status(201).json({
                message: 'Order created and awaiting payment confirmation',
                order
            });
        } catch (error) {
            return handleServerError(res, error, 'cart:checkout');
        }
    }
}

module.exports = CartController;
