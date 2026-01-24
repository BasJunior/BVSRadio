// Product Controller
const Product = require('../models/Product');

class ProductController {
    constructor(pool) {
        this.productModel = new Product(pool);
    }

    async getAllProducts(req, res) {
        try {
            const filters = {
                category: req.query.category
            };
            const products = await this.productModel.findAll(filters);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProduct(req, res) {
        try {
            const product = await this.productModel.findById(req.params.id);
            
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createProduct(req, res) {
        try {
            const product = await this.productModel.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await this.productModel.update(req.params.id, req.body);
            
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            await this.productModel.delete(req.params.id);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProductController;
