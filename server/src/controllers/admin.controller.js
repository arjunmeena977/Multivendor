const Vendor = require('../models/vendor.model');
const Product = require('../models/product.model');
const Settlement = require('../models/settlement.model');
const Commission = require('../models/commission.model');

// --- VENDOR MANAGEMENT ---
const getVendors = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const vendors = await Vendor.find(query).populate('userId', 'email name');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED
        const vendor = await Vendor.findByIdAndUpdate(id, { status }, { new: true });
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (error) {
        console.error('Update Vendor Status Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- PRODUCT MANAGEMENT ---
const getProducts = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const products = await Product.find(query).populate('vendorId', 'shopName');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED/REJECTED

        const updates = { status };
        // If approved, set visible. If rejected, hide.
        if (status === 'APPROVED') updates.isVisible = true;
        if (status === 'REJECTED') updates.isVisible = false;

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

const toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVisible } = req.body;
        const product = await Product.findByIdAndUpdate(id, { isVisible }, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// --- SETTLEMENT MANAGEMENT ---
const generateSettlement = async (req, res) => {
    try {
        const { vendorId, from, to } = req.body;

        // Find commissions for this vendor created between dates
        const query = { vendorId };
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        const earnings = await Commission.find(query);

        if (earnings.length === 0) {
            return res.status(400).json({ error: 'No earnings found for this period' });
        }

        const commissionTotal = earnings.reduce((sum, item) => sum + Number(item.commissionAmount), 0);
        const vendorNet = earnings.reduce((sum, item) => sum + Number(item.vendorEarning), 0);
        const grossSales = commissionTotal + vendorNet;

        // Note: Settlement Schema (created in step 221) doesn't have periodStart/End fields explicitly?
        // Let's check Schema...
        // settlementSchema has: vendorId, amount, status, generatedAt, paidAt.
        // It DOES NOT have periodStart/End, grossSales, commissionTotal.
        // So I should adapt logic or update schema.
        // I will adapt logic to fit Schema: amount = netPayable.

        const settlement = await Settlement.create({
            vendorId,
            amount: vendorNet,
            status: 'PENDING',
            generatedAt: new Date()
        });

        res.json(settlement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Settlement generation failed' });
    }
};

const getSettlements = async (req, res) => {
    try {
        const settlements = await Settlement.find().populate('vendorId', 'shopName');
        res.json(settlements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settlements' });
    }
};

const paySettlement = async (req, res) => {
    try {
        const { id } = req.params;
        const settlement = await Settlement.findByIdAndUpdate(id, {
            status: 'PAID',
            paidAt: new Date()
        }, { new: true });

        if (!settlement) return res.status(404).json({ error: 'Settlement not found' });
        res.json(settlement);
    } catch (error) {
        res.status(500).json({ error: 'Payment mark failed' });
    }
};

module.exports = {
    getVendors,
    updateVendorStatus,
    getProducts,
    updateProductStatus,
    toggleVisibility,
    generateSettlement,
    getSettlements,
    paySettlement
};
