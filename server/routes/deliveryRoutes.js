const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getAssignments,
  getNearbyPickups,
  updateDeliveryProfile
} = require('../controllers/deliveryController');

router.get('/assignments', authenticate, roleCheck(['delivery', 'admin']), getAssignments);
router.get('/nearby-pickups', authenticate, roleCheck(['delivery', 'admin']), getNearbyPickups);
router.put('/profile', authenticate, roleCheck(['delivery', 'admin']), updateDeliveryProfile);

module.exports = router;
