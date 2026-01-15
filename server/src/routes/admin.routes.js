const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken, authorizeRoles('ADMIN'));

// Vendors
router.get('/vendors', adminController.getVendors);
router.patch('/vendors/:id/approve', (req, res) => { req.body.status = 'APPROVED'; adminController.updateVendorStatus(req, res); });
router.patch('/vendors/:id/reject', (req, res) => { req.body.status = 'REJECTED'; adminController.updateVendorStatus(req, res); });

// Products
router.get('/products', adminController.getProducts);
router.patch('/products/:id/approve', (req, res) => { req.body.status = 'APPROVED'; adminController.updateProductStatus(req, res); });
router.patch('/products/:id/reject', (req, res) => { req.body.status = 'REJECTED'; adminController.updateProductStatus(req, res); });
router.patch('/products/:id/visibility', adminController.toggleVisibility);

// Settlements
router.post('/settlements/generate', adminController.generateSettlement);
router.get('/settlements', adminController.getSettlements);
router.patch('/settlements/:id/pay', adminController.paySettlement);

module.exports = router;
