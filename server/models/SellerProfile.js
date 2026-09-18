const mongoose = require('mongoose');

const vaultUnlockSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['Raw Material', 'Packaging', 'Equipment', 'Other'],
    required: true
  },
  date: { type: Date, default: Date.now }
}, { _id: false });

const sellerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, trim: true },
  businessDescription: { type: String, default: '' },
  category: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'suspended'],
    default: 'pending'
  },
  trustCircleVouchedBy: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalOrders: { type: Number, default: 0 },
  vault: {
    balancePercentSetting: { type: Number, default: 10, min: 0, max: 30 },
    lockedAmount: { type: Number, default: 0 },
    unlockHistory: [vaultUnlockSchema]
  },
  walletBalance: { type: Number, default: 0 }
}, { timestamps: true });

sellerProfileSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
