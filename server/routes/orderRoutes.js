const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  markReadyForPickup,
  assignDelivery,
  updateCheckpoint,
  confirmCodPayment,
  markDelivered,
  cancelOrder
} = require('../controllers/orderController');

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

// Seller actions
router.put('/:id/accept', authenticate, roleCheck(['seller', 'admin']), acceptOrder);
router.put('/:id/reject', authenticate, roleCheck(['seller', 'admin']), rejectOrder);
router.put('/:id/ready-for-pickup', authenticate, roleCheck(['seller', 'admin']), markReadyForPickup);

// Delivery & Admin actions
router.put('/:id/assign-delivery', authenticate, roleCheck(['delivery', 'admin']), assignDelivery);
router.put('/:id/checkpoint', authenticate, roleCheck(['delivery', 'admin']), updateCheckpoint);
router.put('/:id/confirm-cod', authenticate, roleCheck(['delivery', 'admin']), confirmCodPayment);
router.put('/:id/mark-delivered', authenticate, roleCheck(['delivery', 'admin']), markDelivered);

// Cancellation
router.post('/:id/cancel', authenticate, cancelOrder);

module.exports = router;
