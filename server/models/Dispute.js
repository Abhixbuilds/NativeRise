const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['order', 'payment', 'delivery', 'product', 'refund'],
    required: true
  },
  description: { type: String, required: true },
  voiceNoteUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'under_trust_circle_review', 'under_admin_review', 'resolved'],
    default: 'open'
  },
  mediatedBy: { type: String, default: '' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNote: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
