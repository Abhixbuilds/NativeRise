const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');

const createReview = async (req, res, next) => {
  try {
    const { orderId, targetType, targetId, rating, comment } = req.body;

    if (!orderId || !targetType || !targetId || !rating) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Order ID, target type, target ID and rating are required' }
      });
    }

    const review = await Review.create({
      orderId,
      customerId: req.user._id,
      targetType,
      targetId,
      rating: Number(rating),
      comment: comment || ''
    });

    // Recompute average rating for target
    const allReviews = await Review.find({ targetType, targetId });
    const avgRating = Number(
      (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    );

    if (targetType === 'product') {
      await Product.findByIdAndUpdate(targetId, { rating: avgRating });
    } else if (targetType === 'seller') {
      await SellerProfile.findByIdAndUpdate(targetId, { rating: avgRating });
    } else if (targetType === 'delivery') {
      await DeliveryPartnerProfile.findByIdAndUpdate(targetId, { rating: avgRating });
    }

    res.status(201).json({
      success: true,
      data: { review, avgRating }
    });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    const filter = {};

    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    const reviews = await Review.find(filter)
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getReviews };
