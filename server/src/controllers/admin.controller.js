const prisma = require('../prisma.client');

// --- VENDOR MANAGEMENT ---
const getVendors = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const vendors = await prisma.vendor.findMany({
            where,
            include: { user: { select: { email: true, name: true } } }
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const vendor = await prisma.vendor.update({
            where: { id },
            data: { status }
        });
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// --- PRODUCT MANAGEMENT ---
const getProducts = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const products = await prisma.product.findMany({
            where,
            include: { vendor: { select: { shopName: true } } }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED/REJECTED
        const product = await prisma.product.update({
            where: { id },
            data: {
                status,
                // If approved, make visible by default? Or keep manual? 
                // Guideline: "Only APPROVED + isVisible=true products customer ko dikhte"
                // Let's set isVisible=true on approval for convenience, or let Admin toggle it separately.
                isVisible: status === 'APPROVED'
            }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

const toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVisible } = req.body;
        const product = await prisma.product.update({
            where: { id },
            data: { isVisible }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// --- SETTLEMENT MANAGEMENT ---
const generateSettlement = async (req, res) => {
    try {
        const { vendorId, from, to } = req.body;
        // Calculate earnings for date range
        const earnings = await prisma.commission.findMany({
            where: {
                vendorId,
                orderItem: {
                    order: {
                        createdAt: {
                            gte: new Date(from),
                            lte: new Date(to)
                        }
                    }
                }
            }
        });

        const grossSales = earnings.reduce((sum, item) => sum + Number(item.commissionAmount) + Number(item.vendorEarning), 0); // commissionAmount + vendorEarning = lineTotal approx? Wait. lineTotal = commission + earning. Yes.
        // Or fetch lineTotal from orderItem.
        // Actually lineTotal is stored in orderItem.
        // Let's iterate earnings to be safe.
        // But wait, I need to fetch orderItem to get lineTotal if I didn't store it in commission. I did store commissionAmount and vendorEarning. Summing them should be lineTotal.

        const commissionTotal = earnings.reduce((sum, item) => sum + Number(item.commissionAmount), 0);
        const vendorNet = earnings.reduce((sum, item) => sum + Number(item.vendorEarning), 0);

        const settlement = await prisma.settlement.create({
            data: {
                vendorId,
                periodStart: new Date(from),
                periodEnd: new Date(to),
                grossSales: grossSales, // Approximate or precise sum
                commissionTotal: commissionTotal,
                netPayable: vendorNet,
                status: 'PENDING'
            }
        });

        res.json(settlement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Settlement generation failed' });
    }
};

const getSettlements = async (req, res) => {
    try {
        const settlements = await prisma.settlement.findMany({
            include: { vendor: { select: { shopName: true } } }
        });
        res.json(settlements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settlements' });
    }
};

const paySettlement = async (req, res) => {
    try {
        const { id } = req.params;
        const settlement = await prisma.settlement.update({
            where: { id },
            data: { status: 'PAID', paidAt: new Date() }
        });
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
