// Gift Controller - handles cross-platform gifting from organizations to users
const Gift = require('../models/Gift');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Supported payment methods available locally (Paynow aggregates these)
const SUPPORTED_PAYMENT_METHODS = ['ecocash', 'onemoney', 'telecash', 'visa', 'mastercard', 'paynow'];

class GiftController {
    constructor(pool) {
        this.giftModel = new Gift(pool);
        this.orgModel = new Organization(pool);
        this.userModel = new User(pool);
    }

    // Generate a Paynow payment link for a gift
    _generatePaynowLink(gift, orgEmail) {
        const params = `search=${encodeURIComponent(orgEmail)}&amount=${gift.amount}&reference=gift-${gift.id}&l=1`;
        const encodedParams = Buffer.from(params).toString('base64');
        return `https://www.paynow.co.zw/Payment/Link/?q=${encodedParams}`;
    }

    // POST /api/gifts - Send a gift from an organization to a user
    async sendGift(req, res) {
        try {
            const { organization_id, recipient_id, amount, currency, message, payment_method } = req.body;

            if (!organization_id || !recipient_id || !amount) {
                return res.status(400).json({ error: 'organization_id, recipient_id, and amount are required' });
            }

            if (parseFloat(amount) <= 0) {
                return res.status(400).json({ error: 'amount must be greater than zero' });
            }

            if (payment_method && !SUPPORTED_PAYMENT_METHODS.includes(payment_method.toLowerCase())) {
                return res.status(400).json({
                    error: 'Unsupported payment method',
                    supported: SUPPORTED_PAYMENT_METHODS
                });
            }

            // Verify organization exists
            const org = await this.orgModel.findById(organization_id);
            if (!org) {
                return res.status(404).json({ error: 'Organization not found' });
            }

            // Verify recipient user exists
            const recipient = await this.userModel.findById(recipient_id);
            if (!recipient) {
                return res.status(404).json({ error: 'Recipient user not found' });
            }

            // Normalize payment method to lowercase before storing
            const normalizedPaymentMethod = (payment_method || 'paynow').toLowerCase();

            // Create the gift record (without paynow_link initially, as we need the gift ID first)
            const gift = await this.giftModel.create({
                organization_id,
                recipient_id,
                amount,
                currency: currency || 'USD',
                message,
                payment_method: normalizedPaymentMethod
            });

            // Generate Paynow payment link so the organization can complete the payment
            const paynowLink = this._generatePaynowLink(gift, org.email);

            // Persist the generated payment link to the database
            const updatedGift = await this.giftModel.updatePaynowLink(gift.id, paynowLink);

            res.status(201).json({
                message: 'Gift created successfully. Complete payment using the Paynow link.',
                gift: updatedGift,
                paynow_link: paynowLink,
                payment_methods: SUPPORTED_PAYMENT_METHODS
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/gifts/received - Get gifts received by the authenticated user
    async getReceivedGifts(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            const gifts = await this.giftModel.getReceivedGifts(userId, limit);
            res.json(gifts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/gifts/sent/:organizationId - Get gifts sent by an organization
    async getSentGifts(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const limit = parseInt(req.query.limit) || 50;
            const gifts = await this.giftModel.getSentGifts(organizationId, limit);
            res.json(gifts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/gifts/:id - Get a single gift by ID
    async getGift(req, res) {
        try {
            const gift = await this.giftModel.findById(req.params.id);
            if (!gift) {
                return res.status(404).json({ error: 'Gift not found' });
            }
            res.json(gift);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // PUT /api/gifts/:id/status - Update gift status (e.g., after payment confirmation)
    async updateGiftStatus(req, res) {
        try {
            const { status, payment_reference } = req.body;
            const validStatuses = ['pending', 'paid', 'claimed', 'cancelled'];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    valid_statuses: validStatuses
                });
            }

            const gift = await this.giftModel.findById(req.params.id);
            if (!gift) {
                return res.status(404).json({ error: 'Gift not found' });
            }

            const updatedGift = await this.giftModel.updateStatus(gift.id, status, payment_reference);
            res.json({ message: 'Gift status updated', gift: updatedGift });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/gifts/stats/:organizationId - Get gift statistics for an organization
    async getGiftStats(req, res) {
        try {
            const stats = await this.giftModel.getStats(req.params.organizationId);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/organizations - List all active organizations
    async getOrganizations(req, res) {
        try {
            const organizations = await this.orgModel.getAll(true);
            res.json(organizations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // POST /api/organizations - Register a new organization
    async createOrganization(req, res) {
        try {
            const { name, email, description, logo_url, website, country } = req.body;

            if (!name || !email) {
                return res.status(400).json({ error: 'name and email are required' });
            }

            const existing = await this.orgModel.findByEmail(email);
            if (existing) {
                return res.status(409).json({ error: 'An organization with this email already exists' });
            }

            const org = await this.orgModel.create({ name, email, description, logo_url, website, country });
            res.status(201).json(org);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/organizations/:id - Get a single organization by ID
    async getOrganization(req, res) {
        try {
            const org = await this.orgModel.findById(req.params.id);
            if (!org) {
                return res.status(404).json({ error: 'Organization not found' });
            }
            res.json(org);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = GiftController;
