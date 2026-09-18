const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { refundPayment } = require('../controllers/checkoutController');

router.post('/:id/refund', authenticate, roleCheck(['admin', 'seller']), refundPayment);

module.exports = router;
