const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const checkpointSchema = new mongoose.Schema({
  location: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const profitBreakdownSchema = new mongoose.Schema({
  productCost: Number,
  packagingCost: Number,
  deliveryCost: Number,
  platformFeePercent: Number,
  paymentFeePercent: Number,
  actualProfit: Number,
  profitMarginPercent: Number
}, { _id: false });
const makerOrderSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
  items: [orderItemSchema],
  profitBreakdown: profitBreakdownSchema,
  status: {
    type: String,
    enum: ['placed', 'accepted', 'rejected', 'ready_for_pickup', 'picked_up',
           'in_transit', 'delivered', 'cancelled', 'refunded'],
    default: 'placed'
  },
  deliveryCost: { type: Number, required: true }
}, { _id: false });


const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
  items: [orderItemSchema],
  makerOrders: [makerOrderSchema],
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'rejected', 'ready_for_pickup', 'picked_up',
           'in_transit', 'delivered', 'cancelled', 'refunded'],
    default: 'placed'
  },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartnerProfile', default: null },
  deliveryCost: { type: Number, required: true },
  checkpoints: [checkpointSchema],
  etaEstimate: { type: Date },
  weatherAdjustedDelay: { type: Boolean, default: false },
  profitBreakdown: profitBreakdownSchema,
  rejectionReason: { type: String, default: '' },
  cancellationRequestedBy: { type: String, enum: ['customer', 'seller', null], default: null }
}, { timestamps: true });

orderSchema.index({ customerId: 1 });
orderSchema.index({ sellerId: 1 });
orderSchema.index({ deliveryPartnerId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
