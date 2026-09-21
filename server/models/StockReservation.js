const mongoose = require('mongoose');

const stockReservationSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('StockReservation', stockReservationSchema);
