const SellerProfile = require('../models/SellerProfile');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');
const { emitToUser, broadcastEvent } = require('../config/socket');

const getPendingSellers = async (req, res, next) => {
  try {
    const sellers = await SellerProfile.find({ verificationStatus: 'pending' })
      .populate('userId', 'name email phone address createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { sellers }
    });
  } catch (error) {
    next(error);
  }
};

const approveSeller = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findById(req.params.id).populate('userId');
    if (!seller) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Seller not found' } });
    }

    seller.verificationStatus = 'approved';
    await seller.save();

    if (seller.userId) {
      emitToUser(seller.userId._id.toString(), 'seller:approved', {
        sellerId: seller._id,
        businessName: seller.businessName
      });

      await Notification.create({
        userId: seller.userId._id,
        title: 'Seller Account Approved!',
        message: 'Congratulations! Your seller profile has been approved. Your products are now live on the marketplace.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        seller,
        message: `Seller "${seller.businessName}" approved successfully.`
      }
    });
  } catch (error) {
    next(error);
  }
};

const suspendSeller = async (req, res, next) => {
  try {
    const { reason = 'Terms violation' } = req.body;
    const seller = await SellerProfile.findById(req.params.id).populate('userId');
    if (!seller) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Seller not found' } });
    }

    seller.verificationStatus = 'suspended';
    await seller.save();

    if (seller.userId) {
      await Notification.create({
        userId: seller.userId._id,
        title: 'Account Suspended',
        message: `Your seller profile has been suspended. Reason: ${reason}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        seller,
        message: `Seller "${seller.businessName}" has been suspended.`
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalSellers,
      totalOrders,
      orders,
      openDisputes,
      pendingSellersCount,
      totalCustomers
    ] = await Promise.all([
      SellerProfile.countDocuments({ verificationStatus: 'approved' }),
      Order.countDocuments(),
      Order.find({ status: { $nin: ['cancelled', 'rejected'] } }).select('items deliveryCost'),
      Dispute.countDocuments({ status: { $in: ['open', 'under_trust_circle_review', 'under_admin_review'] } }),
      SellerProfile.countDocuments({ verificationStatus: 'pending' }),
      User.countDocuments({ role: 'customer' })
    ]);

    let gmv = 0;
    orders.forEach(o => {
      const itemsSum = o.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      gmv += itemsSum + (o.deliveryCost || 0);
    });

    res.status(200).json({
      success: true,
      data: {
        totalSellers,
        totalOrders,
        gmv: Math.round(gmv),
        openDisputes,
        pendingSellersCount,
        totalCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalResults] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email phone')
        .populate('sellerId', 'businessName category')
        .populate('deliveryPartnerId', 'serviceZone vehicleType')
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        page: pageNum,
        totalPages: Math.ceil(totalResults / limitNum) || 1,
        totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const { status, paymentMode, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (paymentMode && paymentMode !== 'all') filter.paymentMode = paymentMode;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [payments, totalResults, deliveryPartners] = await Promise.all([
      Payment.find(filter)
        .populate({
          path: 'linkedOrders',
          populate: [
            { path: 'customerId', select: 'name email' },
            { path: 'sellerId', select: 'businessName' }
          ]
        })
        .populate({
          path: 'reconciledBy',
          populate: { path: 'userId', select: 'name' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(filter),
      DeliveryPartnerProfile.find().populate('userId', 'name email phone')
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        deliveryPartners,
        page: pageNum,
        totalPages: Math.ceil(totalResults / limitNum) || 1,
        totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

const adjustCodFloat = async (req, res, next) => {
  try {
    const { partnerId, adjustmentAmount, note } = req.body;
    const partner = await DeliveryPartnerProfile.findById(partnerId);

    if (!partner) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery partner not found' } });
    }

    partner.codFloatBalance = Math.max(0, (partner.codFloatBalance || 0) + Number(adjustmentAmount));
    await partner.save();

    res.status(200).json({
      success: true,
      data: {
        partner,
        message: `Adjusted COD Float Balance for ${partner._id}. New balance: ₹${partner.codFloatBalance}`
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingSellers,
  approveSeller,
  suspendSeller,
  getAdminAnalytics,
  getAllOrders,
  getAllPayments,
  adjustCodFloat
};
