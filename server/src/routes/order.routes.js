const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken, authorizeRoles('CUSTOMER'));

router.post('/', orderController.createOrder);
router.get('/me', orderController.getMyOrders);

module.exports = router;
