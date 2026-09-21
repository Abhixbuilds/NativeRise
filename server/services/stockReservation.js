// server/services/stockReservation.js
/**
 * Stock Reservation Service
 * Reserves product stock for a cart item with a time‑limited lock (default 10 minutes).
 * Exposes: reserveStock(productId, quantity, sellerId) and releaseExpiredReservations().
 */
const mongoose = require('mongoose');
const Product = require('../models/Product'); // assumes a Product model exists

// In‑memory map to track reservations (productId -> [{orderId, qty, expiresAt}])
const reservations = {};

/**
 * Reserve stock for a given product.
 * @param {String} productId - Mongo ObjectId string of the product.
 * @param {Number} quantity - Qty to reserve.
 * @param {String} sellerId - Seller owning the product (for possible multi‑seller logic).
 * @returns {Promise<Boolean>} resolves true if reservation succeeded.
 */
async function reserveStock(productId, quantity, sellerId) {
  const prod = await Product.findById(productId);
  if (!prod) throw new Error('Product not found');
  // Compute currently reserved amount
  const now = Date.now();
  const currentReservations = (reservations[productId] || []).filter(r => r.expiresAt > now);
  const reservedQty = currentReservations.reduce((sum, r) => sum + r.qty, 0);
  if (prod.stock < reservedQty + quantity) {
    return false; // not enough stock
  }
  // Add reservation for 10 minutes
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes
  currentReservations.push({ qty: quantity, expiresAt, sellerId });
  reservations[productId] = currentReservations;
  return true;
}

/**
 * Release any reservations that have expired.
 * This function is meant to be called by a cron job every minute.
 */
function releaseExpiredReservations() {
  const now = Date.now();
  Object.keys(reservations).forEach(productId => {
    const stillValid = reservations[productId].filter(r => r.expiresAt > now);
    if (stillValid.length) {
      reservations[productId] = stillValid;
    } else {
      delete reservations[productId];
    }
  });
}

module.exports = { reserveStock, releaseExpiredReservations, __internal: { reservations } };
