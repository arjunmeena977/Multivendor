const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const Vendor = require('../models/vendor.model'); // Ensure model is loaded if needed for populate

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({
            status: 'APPROVED',
            isVisible: true
        }).populate('vendorId', 'shopName'); // Populating vendorId (ref Vendor). Field in schema is vendorId.

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
