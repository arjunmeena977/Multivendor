const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// All routes require VENDOR role
router.use(authenticateToken, authorizeRoles('VENDOR'));

router.get('/me', vendorController.getMe);
router.get('/products', vendorController.getProducts);
router.post('/products', vendorController.addProduct);
router.put('/products/:id', vendorController.updateProduct);
router.delete('/products/:id', vendorController.deleteProduct);
router.get('/earnings', vendorController.getEarnings);

module.exports = router;
