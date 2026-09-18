const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  estimateDelivery,
  createCheckoutOrder,
  verifyPaymentAndCreateOrders
} = require('../controllers/checkoutController');

router.post('/estimate-delivery', authenticate, estimateDelivery);
router.post('/create-order', authenticate, createCheckoutOrder);
router.post('/verify-payment', authenticate, verifyPaymentAndCreateOrders);

module.exports = router;
