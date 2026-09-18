const mongoose = require('mongoose');

const deliveryPartnerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  serviceZone: { type: String, required: true },
  vehicleType: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  activeHubLocation: { type: String, required: true },
  codFloatBalance: { type: Number, default: 0 }
}, { timestamps: true });

deliveryPartnerProfileSchema.index({ serviceZone: 1 });

module.exports = mongoose.model('DeliveryPartnerProfile', deliveryPartnerProfileSchema);
