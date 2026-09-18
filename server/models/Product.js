const mongoose = require('mongoose');

const dimensionsSchema = new mongoose.Schema({
  length: Number,
  width: Number,
  height: Number
}, { _id: false });

const provenanceCardSchema = new mongoose.Schema({
  artisanStory: { type: String, default: '' },
  region: { type: String, default: '' },
  processNote: { type: String, default: '' },
  qrCodeUrl: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
  name: { type: String, required: true, trim: true },
  descriptionOriginal: { type: String, required: true },
  originalLanguage: {
    type: String,
    enum: ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa'],
    default: 'en'
  },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  productCost: { type: Number, default: 0 },
  packagingCost: { type: Number, default: 0 },
  stock: { type: Number, required: true, min: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
  images: [{ type: String }],
  weightGrams: { type: Number, required: true },
  dimensions: dimensionsSchema,
  provenanceCard: provenanceCardSchema,
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', descriptionOriginal: 'text' });

module.exports = mongoose.model('Product', productSchema);
