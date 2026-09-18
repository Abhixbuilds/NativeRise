const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const { transcribeAudio } = require('../services/speech-to-text');
const { emitToUser, emitToRole } = require('../config/socket');

const getDisputes = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;

    if (req.user.role === 'customer') {
      filter.raisedBy = req.user._id;
    } else if (req.user.role === 'seller') {
      const seller = await SellerProfile.findOne({ userId: req.user._id });
      if (seller) {
        const sellerOrders = await Order.find({ sellerId: seller._id }).select('_id');
        filter.orderId = { $in: sellerOrders.map(o => o._id) };
      } else {
        return res.status(200).json({ success: true, data: { disputes: [] } });
      }
    }

    const disputes = await Dispute.find(filter)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'customerId', select: 'name email phone' },
          { path: 'sellerId', select: 'businessName trustCircleVouchedBy' },
          { path: 'paymentId' }
        ]
      })
      .populate('raisedBy', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { disputes }
    });
  } catch (error) {
    next(error);
  }
};

const createDispute = async (req, res, next) => {
  try {
    const { orderId, category, description, voiceNoteUrl } = req.body;

    if (!orderId || !category || !description) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Order ID, category and description are required' }
      });
    }

    const order = await Order.findById(orderId).populate('sellerId');
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
      });
    }

    // Community Trust Circle logic (§7.13):
    // If seller has trustCircleVouchedBy, start under_trust_circle_review, else under_admin_review
    const initialStatus = order.sellerId?.trustCircleVouchedBy
      ? 'under_trust_circle_review'
      : 'under_admin_review';

    const dispute = await Dispute.create({
      orderId,
      raisedBy: req.user._id,
      category,
      description,
      voiceNoteUrl: voiceNoteUrl || '',
      status: initialStatus,
      mediatedBy: order.sellerId?.trustCircleVouchedBy || ''
    });

    emitToRole('admin', 'dispute:created', {
      disputeId: dispute._id,
      orderId,
      category,
      status: initialStatus
    });

    res.status(201).json({
      success: true,
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

const uploadVoiceNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'Audio file is required' }
      });
    }

    const voiceNoteUrl = `/uploads/${req.file.filename}`;
    const transcribedText = await transcribeAudio(voiceNoteUrl);

    res.status(200).json({
      success: true,
      data: {
        voiceNoteUrl,
        transcribedText
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateTrustCircleReview = async (req, res, next) => {
  try {
    const { outcomeNote, escalateToAdmin = false } = req.body;
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dispute not found' } });
    }

    dispute.resolutionNote = outcomeNote || dispute.resolutionNote;
    if (escalateToAdmin) {
      dispute.status = 'under_admin_review';
    }

    await dispute.save();

    res.status(200).json({
      success: true,
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { resolutionNote, triggerRefund = false } = req.body;
    const dispute = await Dispute.findById(req.params.id).populate('orderId');

    if (!dispute) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dispute not found' } });
    }

    dispute.status = 'resolved';
    dispute.resolvedBy = req.user._id;
    dispute.resolutionNote = resolutionNote || 'Resolved by administrator.';

    if (triggerRefund && dispute.orderId) {
      const order = await Order.findById(dispute.orderId._id);
      if (order) {
        order.status = 'refunded';
        order.checkpoints.push({
          location: 'Admin Dispute Panel',
          status: `DISPUTE RESOLVED - REFUND ISSUED: ${resolutionNote}`,
          timestamp: new Date(),
          updatedBy: req.user._id
        });

        // Restock items
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }

        await Payment.findByIdAndUpdate(order.paymentId, { status: 'refunded' });
        await order.save();

        emitToUser(order.customerId.toString(), 'payment:status-changed', {
          paymentId: order.paymentId,
          status: 'refunded'
        });
      }
    }

    await dispute.save();

    emitToUser(dispute.raisedBy.toString(), 'dispute:resolved', {
      disputeId: dispute._id,
      resolutionNote: dispute.resolutionNote
    });

    res.status(200).json({
      success: true,
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDisputes,
  createDispute,
  uploadVoiceNote,
  updateTrustCircleReview,
  resolveDispute
};
