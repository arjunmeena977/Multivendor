const prisma = require('../prisma.client');
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

        // Use transaction for consistency
        const result = await prisma.$transaction(async (prisma) => {
            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });

                if (!product) throw new Error(`Product ${item.productId} not found`);
                if (product.status !== 'APPROVED' || !product.isVisible) {
                    throw new Error(`Product ${product.title} is not available`);
                }
                if (product.stock < item.qty) {
                    throw new Error(`Insufficient stock for ${product.title}`);
                }

                // Decrement stock
                await prisma.product.update({
                    where: { id: product.id },
                    data: { stock: product.stock - item.qty }
                });

                const unitPrice = parseFloat(product.price);
                const lineTotal = unitPrice * item.qty;
                totalAmount += lineTotal;

                orderItems.push({
                    product,
                    qty: item.qty,
                    unitPrice,
                    lineTotal
                });
            }

            // Create Order
            const order = await prisma.order.create({
                data: {
                    customerId: userId,
                    totalAmount,
                    status: 'PLACED'
                }
            });

            // Create Order Items & Commission Snapshots
            for (const item of orderItems) {
                const createdItem = await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.product.id,
                        vendorId: item.product.vendorId, // Important for scoping
                        qty: item.qty,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal
                    }
                });

                // Snapshot Commission
                const commissionAmount = item.lineTotal * COMMISSION_RATE;
                const vendorEarning = item.lineTotal - commissionAmount;

                await prisma.commission.create({
                    data: {
                        orderItemId: createdItem.id,
                        vendorId: item.product.vendorId,
                        commissionRate: COMMISSION_RATE * 100, // store as percentage e.g. 10
                        commissionAmount,
                        vendorEarning
                    }
                });
            }

            return order;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || 'Order failed' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { customerId: req.user.userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

module.exports = { createOrder, getMyOrders };
