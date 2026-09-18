const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getSellerPublicProfile,
  getSellerAnalytics,
  getSellerVault,
  updateVaultSettings,
  unlockVaultFunds,
  getCatalogShare,
  updateSellerProfile
} = require('../controllers/sellerController');

// Public profile
router.get('/:id', getSellerPublicProfile);

// Authenticated seller endpoints
router.get('/me/analytics', authenticate, roleCheck(['seller', 'admin']), getSellerAnalytics);
router.get('/me/vault', authenticate, roleCheck(['seller', 'admin']), getSellerVault);
router.put('/me/vault/settings', authenticate, roleCheck(['seller', 'admin']), updateVaultSettings);
router.post('/me/vault/unlock', authenticate, roleCheck(['seller', 'admin']), unlockVaultFunds);
router.get('/me/catalog-share', authenticate, roleCheck(['seller', 'admin']), getCatalogShare);
router.put('/me/profile', authenticate, roleCheck(['seller', 'admin']), updateSellerProfile);

module.exports = router;
