const prisma = require('../prisma.client');
const { z } = require('zod');

const productSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().nonnegative()
});

const getMe = async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { userId: req.user.userId },
            include: { user: { select: { name: true, email: true } } }
        });
        if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { vendorId: req.user.vendorId }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const addProduct = async (req, res) => {
    try {
        const { title, description, price, stock } = productSchema.parse(req.body);

        const product = await prisma.product.create({
            data: {
                vendorId: req.user.vendorId,
                title,
                description,
                price,
                stock,
                status: 'PENDING', // Default
                isVisible: false
            }
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

        // Verify ownership
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.vendorId !== req.user.vendorId) {
            return res.status(403).json({ error: 'Unauthorized to edit this product' });
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                title, description, price, stock,
                status: 'PENDING', // Reset approval on edit
                isVisible: false
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message || 'Update failed' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing || existing.vendorId !== req.user.vendorId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

const getEarnings = async (req, res) => {
    try {
        const { from, to } = req.query;
        // Basic date filter if provided
        const dateFilter = {};
        if (from) dateFilter.gte = new Date(from);
        if (to) dateFilter.lte = new Date(to);

        // Snapshot based earnings from Commissions table
        const earnings = await prisma.commission.findMany({
            where: {
                vendorId: req.user.vendorId,
                // Optional: filter by order date via OrderItem->Order->createdAt but Commission table doesn't have date. 
                // We can link commission to orderItem -> order.
                orderItem: {
                    order: {
                        createdAt: {
                            gte: dateFilter.gte,
                            lte: dateFilter.lte
                        }
                    }
                }
            },
            include: {
                orderItem: {
                    include: {
                        product: { select: { title: true } }
                    }
                }
            }
        });

        const totalEarnings = earnings.reduce((sum, item) => sum + Number(item.vendorEarning), 0);
        const totalSales = earnings.reduce((sum, item) => sum + Number(item.orderItem.lineTotal), 0);

        res.json({
            summary: { totalSales, totalEarnings },
            details: earnings
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
