const express = require('express');
const router = express.Router();
const prisma = require('../prisma.client');

router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: 'APPROVED',
                isVisible: true
            },
            include: { vendor: { select: { shopName: true } } }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
