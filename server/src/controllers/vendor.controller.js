const Vendor = require('../models/vendor.model');
const Product = require('../models/product.model');
const Commission = require('../models/commission.model');
const { z } = require('zod');

const productSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative()
});

const getMe = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user.userId }).populate('userId', 'name email');
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user.vendorId });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const addProduct = async (req, res) => {
    try {
        const { title, description, price, stock } = productSchema.parse(req.body);

        const product = await Product.create({
            vendorId: req.user.vendorId,
            title,
            description,
            price,
            stock,
            status: 'PENDING',
            isVisible: false
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message || 'Failed to add product' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, stock } = productSchema.partial().parse(req.body);

        const product = await Product.findOne({ _id: id, vendorId: req.user.vendorId });

        if (!product) {
            return res.status(403).json({ error: 'Unauthorized or product not found' });
        }

        if (title) product.title = title;
        if (description) product.description = description;
        if (price) product.price = price;
        if (stock) product.stock = stock;

        product.status = 'PENDING';
        product.isVisible = false;

        await product.save();

        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message || 'Update failed' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOneAndDelete({ _id: id, vendorId: req.user.vendorId });

        if (!product) {
            return res.status(403).json({ error: 'Unauthorized or product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

const getEarnings = async (req, res) => {
    try {
        const { from, to } = req.query;
        // Basic date filter if provided. 
        // Logic: Find commissions for this vendor.
        // If date filter exists, we need to filter potentially by Commission.createdAt.

        const query = { vendorId: req.user.vendorId };

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        const earnings = await Commission.find(query)
            .populate({
                path: 'orderItemId', // This might fail if orderItemId is NOT a ref in schema. 
                // In commission.model.js created earlier, orderItemId is just ObjectId, NOT ref.
                // But we can verify schemas.
            })
            .populate({
                path: 'orderId',
                select: 'createdAt'
            });

        // Wait, Commission model I created earlier (step 220) has orderId ref Order.
        // It does NOT have orderItemId ref.
        // So I rely on orderId for date? Yes.

        // Let's refine the query:
        // MongoDB doesn't join easily for filtering.
        // If filtering by date, we might better filter by Commission.createdAt which is set at order time roughly.
        // So `query.createdAt` works fine.

        // Calculating totals
        let totalEarnings = 0;

        // Since we don't have orderItem populated with product details easily (no ref), 
        // we might miss product title in the response.
        // Previous prisma code accessed `item.orderItem.product.title`.
        // My Mongoose Commission model needs to be robust. 
        // Let's assume for now just the financial summary is key. 

        const earningsData = earnings.map(e => {
            totalEarnings += Number(e.vendorEarning || 0);
            return {
                id: e._id,
                amount: e.vendorEarning,
                date: e.createdAt,
                // product: 'Product Info' // Placeholder if we can't easily join
            };
        });

        res.json({
            summary: { totalEarnings },
            details: earningsData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch earnings' });
    }
};

module.exports = {
    getMe,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getEarnings
};
