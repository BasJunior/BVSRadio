// Product Controller
const Product = require('../models/Product');
const { positiveInt, boundedInt, cleanString, optionalHttpUrl, sendValidationError } = require('../middleware/validation');
const { handleServerError } = require('../utils/http');

class ProductController {
    constructor(pool) {
        this.productModel = new Product(pool);
    }

    validateProductBody(body, { requireName = false } = {}) {
        const name = cleanString(body.name, { min: requireName ? 1 : 0, max: 160, required: requireName });
        const description = cleanString(body.description, { max: 5000 });
        const category = cleanString(body.category, { max: 80 });
        const imageUrl = optionalHttpUrl(body.image_url);
        const stockQuantity = body.stock_quantity == null
            ? undefined
            : boundedInt(body.stock_quantity, { min: 0, max: 1_000_000 });
        const price = body.price == null ? undefined : Number(body.price);
        const isAvailable = body.is_available == null ? undefined : body.is_available;

        if (name === null || description === null || category === null || imageUrl === null || stockQuantity === null) return null;
        if (price !== undefined && (!Number.isFinite(price) || price < 0 || price > 1_000_000)) return null;
        if (isAvailable !== undefined && typeof isAvailable !== 'boolean') return null;

        return {
            name,
            description,
            category,
            image_url: imageUrl,
            stock_quantity: stockQuantity,
            price,
            is_available: isAvailable
        };
    }

    async getAllProducts(req, res) {
        try {
            const category = cleanString(req.query.category, { max: 80 });
            if (category === null) return sendValidationError(res, 'Invalid category');
            const products = await this.productModel.findAll({ category });
            res.json(products);
        } catch (error) {
            return handleServerError(res, error, 'products:list');
        }
    }

    async getProduct(req, res) {
        try {
            const productId = positiveInt(req.params.id);
            if (!productId) return sendValidationError(res, 'Invalid product id');
            const product = await this.productModel.findById(productId);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error) {
            return handleServerError(res, error, 'products:get');
        }
    }

    async createProduct(req, res) {
        try {
            const payload = this.validateProductBody(req.body, { requireName: true });
            if (!payload || payload.price === undefined || payload.stock_quantity === undefined) {
                return sendValidationError(res, 'Invalid product data');
            }
            const product = await this.productModel.create(payload);
            res.status(201).json(product);
        } catch (error) {
            return handleServerError(res, error, 'products:create');
        }
    }

    async updateProduct(req, res) {
        try {
            const productId = positiveInt(req.params.id);
            const payload = this.validateProductBody(req.body);
            if (!productId || !payload) return sendValidationError(res, 'Invalid product update');

            const product = await this.productModel.update(productId, payload);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error) {
            return handleServerError(res, error, 'products:update');
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = positiveInt(req.params.id);
            if (!productId) return sendValidationError(res, 'Invalid product id');
            const existing = await this.productModel.findById(productId);
            if (!existing) return res.status(404).json({ error: 'Product not found' });
            await this.productModel.delete(productId);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            return handleServerError(res, error, 'products:delete');
        }
    }
}

module.exports = ProductController;
