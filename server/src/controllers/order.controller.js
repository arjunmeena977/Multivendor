const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Commission = require('../models/commission.model');
const { z } = require('zod');

const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        qty: z.number().int().positive()
    })).min(1)
});

const COMMISSION_RATE = 0.10; // 10% fixed

const createOrder = async (req, res) => {
    try {
        const { items } = orderSchema.parse(req.body);
        const userId = req.user.userId;

        let totalAmount = 0;
        const orderItemsData = [];

        // 1. Validate and prepare
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.status !== 'APPROVED' || !product.isVisible) {
                throw new Error(`Product ${product.title} is not available`);
            }
            if (product.stock < item.qty) {
                throw new Error(`Insufficient stock for ${product.title}`);
            }

            // Decrement stock immediately (optimistic)
            product.stock -= item.qty;
            await product.save();

            const unitPrice = parseFloat(product.price);
            const lineTotal = unitPrice * item.qty;
            totalAmount += lineTotal;

            orderItemsData.push({
                productId: product._id,
                vendorId: product.vendorId,
                qty: item.qty,
                unitPrice,
                lineTotal
            });
        }

        // 2. Create Order
        const order = await Order.create({
            customerId: userId,
            totalAmount,
            status: 'PLACED',
            items: orderItemsData
        });

        // 3. Create Commissions
        // Iterate over the items in the *created* order to get their subdocument IDs if needed, 
        // or just use the logic loop.
        // My Order schema has `items` as an array of subdocuments.
        // Mongoose assigns _id to subdocuments automatically.

        for (const item of order.items) {
            const commissionAmount = item.lineTotal * COMMISSION_RATE;
            const vendorEarning = item.lineTotal - commissionAmount;

            await Commission.create({
                orderId: order._id,
                orderItemId: item._id, // References the subdocument in Order
                vendorId: item.vendorId,
                commissionRate: COMMISSION_RATE * 100,
                commissionAmount,
                vendorEarning
            });
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(400).json({ error: error.message || 'Order failed' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user.userId })
            .populate('items.productId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

module.exports = { createOrder, getMyOrders };
