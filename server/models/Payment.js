const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'received', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMode: { type: String, enum: ['online', 'cod'], required: true },
  reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartnerProfile', default: null },
  reconciledAt: { type: Date, default: null },
  linkedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
