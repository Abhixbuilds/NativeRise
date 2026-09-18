const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getPendingSellers,
  approveSeller,
  suspendSeller,
  getAdminAnalytics,
  getAllOrders,
  getAllPayments,
  adjustCodFloat
} = require('../controllers/adminController');

router.use(authenticate, roleCheck(['admin']));

router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/suspend', suspendSeller);
router.get('/analytics', getAdminAnalytics);
router.get('/orders', getAllOrders);
router.get('/payments', getAllPayments);
router.put('/cod-float', adjustCodFloat);

module.exports = router;
