// server/services/growthVault.js
/**
 * GrowthVault service – operates on the embedded `vault` field in SellerProfile.
 * On order delivery it immediately locks a percentage of net profit.
 * Unlock is performed via existing seller vault endpoints, so this service only provides `lockProfit`.
 */

const SellerProfile = require('../models/SellerProfile');

/**
 * Lock profit for a delivered order.
 * @param {Object} order - Order document (populated with sellerId and profitBreakdown).
 */
async function lockProfit(order) {
  // Ensure seller profile exists
  const seller = await SellerProfile.findOne({ userId: order.sellerId });
  if (!seller) {
    throw new Error('SellerProfile not found for order');
  }

  const profit = order.profitBreakdown?.actualProfit || 0;
  const vaultPercent = seller.vault?.balancePercentSetting ?? 10;
  const lockAmount = Number(((profit * vaultPercent) / 100).toFixed(2));

  // Initialize vault if missing
  if (!seller.vault) {
    seller.vault = { balancePercentSetting: 10, lockedAmount: 0, unlockHistory: [] };
  }

  seller.vault.lockedAmount = Number(((seller.vault.lockedAmount || 0) + lockAmount).toFixed(2));
  await seller.save();
}

module.exports = { lockProfit };
