const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');
const { emitToUser, emitToRole, broadcastEvent } = require('../config/socket');

const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'seller') {
      const seller = await SellerProfile.findOne({ userId: req.user._id });
      if (!seller) {
        return res.status(200).json({ success: true, data: { orders: [], page: 1, totalPages: 1, totalResults: 0 } });
      }
      filter.sellerId = seller._id;
    } else if (req.user.role === 'delivery') {
      const delivery = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
      if (!delivery) {
        return res.status(200).json({ success: true, data: { orders: [], page: 1, totalPages: 1, totalResults: 0 } });
      }
      filter.$or = [
        { deliveryPartnerId: delivery._id },
        { status: 'ready_for_pickup' }
      ];
    }
    // Admin sees all

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalResults] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email phone address')
        .populate({
          path: 'sellerId',
          select: 'businessName category rating userId verificationStatus trustCircleVouchedBy',
          populate: { path: 'userId', select: 'name phone' }
        })
        .populate({
          path: 'deliveryPartnerId',
          select: 'serviceZone vehicleType rating activeHubLocation userId',
          populate: { path: 'userId', select: 'name phone' }
        })
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalResults / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: {
        orders,
        page: pageNum,
        totalPages,
        totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate({
        path: 'sellerId',
        select: 'businessName category rating userId verificationStatus trustCircleVouchedBy walletBalance vault',
        populate: { path: 'userId', select: 'name phone' }
      })
      .populate({
        path: 'deliveryPartnerId',
        select: 'serviceZone vehicleType rating activeHubLocation userId',
        populate: { path: 'userId', select: 'name phone' }
      })
      .populate('paymentId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const acceptOrder = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Seller only' } });
    }

    const order = await Order.findOne({ _id: req.params.id, sellerId: seller._id });
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Cannot accept order in '${order.status}' status` }
      });
    }

    order.status = 'accepted';
    order.checkpoints.push({
      location: seller.businessName,
      status: 'ORDER_ACCEPTED',
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    // Socket notification to Customer
    emitToUser(order.customerId.toString(), 'order:accepted', {
      orderId: order._id,
      status: 'accepted',
      sellerName: seller.businessName
    });

    await Notification.create({
      userId: order.customerId,
      title: 'Order Accepted',
      message: `Your order #${order._id.toString().slice(-6)} has been accepted by ${seller.businessName}.`
    });

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const rejectOrder = async (req, res, next) => {
  try {
    const { rejectionReason = 'Cannot fulfill' } = req.body;
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Seller only' } });
    }

    const order = await Order.findOne({ _id: req.params.id, sellerId: seller._id });
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    order.status = 'rejected';
    order.rejectionReason = rejectionReason;
    order.checkpoints.push({
      location: seller.businessName,
      status: `REJECTED: ${rejectionReason}`,
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    // Restore stock (§7.6)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // Auto-refund payment linked
    await Payment.findByIdAndUpdate(order.paymentId, { status: 'refunded' });

    await order.save();

    // Socket notification to Customer
    emitToUser(order.customerId.toString(), 'order:rejected', {
      orderId: order._id,
      rejectionReason,
      refundStatus: 'refunded'
    });

    await Notification.create({
      userId: order.customerId,
      title: 'Order Rejected & Refunded',
      message: `Order #${order._id.toString().slice(-6)} was declined by seller (${rejectionReason}). Full refund initiated.`
    });

    res.status(200).json({
      success: true,
      data: { order, refund: { status: 'refunded' } }
    });
  } catch (error) {
    next(error);
  }
};

const markReadyForPickup = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Seller only' } });
    }

    const order = await Order.findOne({ _id: req.params.id, sellerId: seller._id });
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    order.status = 'ready_for_pickup';
    order.checkpoints.push({
      location: seller.businessName,
      status: 'READY_FOR_PICKUP',
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    // Broadcast to Delivery Partners in role room (§9)
    emitToRole('delivery', 'order:ready-for-pickup', {
      orderId: order._id,
      sellerName: seller.businessName,
      itemsCount: order.items.length
    });

    emitToUser(order.customerId.toString(), 'order:checkpoint-updated', {
      orderId: order._id,
      status: 'ready_for_pickup',
      checkpoints: order.checkpoints
    });

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const assignDelivery = async (req, res, next) => {
  try {
    let deliveryPartnerId = null;

    if (req.user.role === 'delivery') {
      const dp = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
      if (dp) deliveryPartnerId = dp._id;
    } else if (req.user.role === 'admin') {
      deliveryPartnerId = req.body.deliveryPartnerId;
    }

    if (!deliveryPartnerId) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_DELIVERY_PARTNER', message: 'Delivery partner required' } });
    }

    const order = await Order.findById(req.params.id).populate('sellerId');
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    order.deliveryPartnerId = deliveryPartnerId;
    order.status = 'picked_up';
    order.checkpoints.push({
      location: 'Pickup Location',
      status: 'PICKED_UP_BY_HUB_AGENT',
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    // Notify Customer, Seller, and Delivery Partner
    emitToUser(order.customerId.toString(), 'order:assigned', { orderId: order._id, status: 'picked_up' });
    if (order.sellerId?.userId) {
      emitToUser(order.sellerId.userId.toString(), 'order:assigned', { orderId: order._id, status: 'picked_up' });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const updateCheckpoint = async (req, res, next) => {
  try {
    const { location, status } = req.body;
    if (!location || !status) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Location and status are required' }
      });
    }

    const order = await Order.findById(req.params.id).populate('sellerId');
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    if (status.includes('TRANSIT') || status.includes('HUB')) {
      order.status = 'in_transit';
    }

    order.checkpoints.push({
      location,
      status,
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    // Broadcast checkpoint update to Customer & Seller (§9)
    emitToUser(order.customerId.toString(), 'order:checkpoint-updated', {
      orderId: order._id,
      status: order.status,
      checkpoints: order.checkpoints
    });

    if (order.sellerId?.userId) {
      emitToUser(order.sellerId.userId.toString(), 'order:checkpoint-updated', {
        orderId: order._id,
        status: order.status,
        checkpoints: order.checkpoints
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const confirmCodPayment = async (req, res, next) => {
  try {
    const dp = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
    const order = await Order.findById(req.params.id).populate('paymentId').populate('sellerId');

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    const payment = await Payment.findById(order.paymentId._id);
    if (!payment) {
      return res.status(404).json({ success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' } });
    }

    payment.status = 'received';
    payment.reconciledBy = dp ? dp._id : null;
    payment.reconciledAt = new Date();
    await payment.save();

    // Credit COD float balance to delivery partner ledger tracking
    if (dp) {
      dp.codFloatBalance = (dp.codFloatBalance || 0) + payment.amount;
      await dp.save();
    }

    emitToUser(order.customerId.toString(), 'payment:status-changed', {
      paymentId: payment._id,
      status: 'received'
    });

    if (order.sellerId?.userId) {
      emitToUser(order.sellerId.userId.toString(), 'payment:status-changed', {
        paymentId: payment._id,
        status: 'received'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment: {
          id: payment._id,
          status: payment.status,
          reconciledBy: payment.reconciledBy,
          reconciledAt: payment.reconciledAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const markDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('sellerId').populate('paymentId');
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    // If COD, ensure cash collection was recorded
    if (order.paymentId?.paymentMode === 'cod' && order.paymentId?.status !== 'received') {
      return res.status(400).json({
        success: false,
        error: { code: 'COD_NOT_CONFIRMED', message: 'Cash collection must be confirmed for COD order before marking delivered' }
      });
    }

    order.status = 'delivered';
    order.checkpoints.push({
      location: 'Customer Doorstep',
      status: 'DELIVERED',
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    // Auto Growth Savings Vault Calculation (§7.8)
    const seller = await SellerProfile.findById(order.sellerId._id);
    if (seller) {
      const profit = order.profitBreakdown?.actualProfit || 0;
      const vaultPercent = seller.vault?.balancePercentSetting || 10;
      const vaultContribution = Number(((profit * vaultPercent) / 100).toFixed(2));
      const walletCredit = Number((profit - vaultContribution).toFixed(2));

      if (!seller.vault) {
        seller.vault = { balancePercentSetting: 10, lockedAmount: 0, unlockHistory: [] };
      }

      seller.vault.lockedAmount = Number(((seller.vault.lockedAmount || 0) + vaultContribution).toFixed(2));
      seller.walletBalance = Number(((seller.walletBalance || 0) + walletCredit).toFixed(2));
      seller.totalOrders = (seller.totalOrders || 0) + 1;

      await seller.save();
    }

    await order.save();

    // Socket notifications
    emitToUser(order.customerId.toString(), 'order:delivered', { orderId: order._id, status: 'delivered' });
    if (seller?.userId) {
      emitToUser(seller.userId.toString(), 'order:delivered', { orderId: order._id, status: 'delivered' });
      await Notification.create({
        userId: seller.userId,
        title: 'Order Delivered & Paid',
        message: `Order #${order._id.toString().slice(-6)} delivered! ₹${order.profitBreakdown?.actualProfit || 0} profit recorded.`
      });
    }

    emitToRole('admin', 'order:delivered', { orderId: order._id });

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const order = await Order.findById(req.params.id).populate('sellerId');

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    // Cancellation & Refund State Machine (§7.5)
    // If status is 'placed' or 'accepted' (before ready_for_pickup) -> AUTO REFUND
    if (order.status === 'placed' || order.status === 'accepted') {
      order.status = 'cancelled';
      order.cancellationRequestedBy = req.user.role === 'customer' ? 'customer' : 'seller';
      order.rejectionReason = reason;

      order.checkpoints.push({
        location: 'Platform System',
        status: `CANCELLED & REFUNDED: ${reason}`,
        timestamp: new Date(),
        updatedBy: req.user._id
      });

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }

      // Update payment to refunded
      await Payment.findByIdAndUpdate(order.paymentId, { status: 'refunded' });

      await order.save();

      emitToUser(order.customerId.toString(), 'payment:status-changed', {
        paymentId: order.paymentId,
        status: 'refunded'
      });

      return res.status(200).json({
        success: true,
        data: {
          order: { id: order._id, status: 'cancelled' },
          refund: { status: 'refunded' }
        }
      });
    }

    // If cancellation requested at 'ready_for_pickup' or later: create Dispute (§7.5)
    const dispute = await Dispute.create({
      orderId: order._id,
      raisedBy: req.user._id,
      category: 'refund',
      description: `Cancellation requested after package preparation. Reason: ${reason}`,
      status: 'under_admin_review'
    });

    order.cancellationRequestedBy = req.user.role === 'customer' ? 'customer' : 'seller';
    await order.save();

    emitToRole('admin', 'dispute:created', {
      disputeId: dispute._id,
      orderId: order._id,
      category: 'refund'
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Order cancellation request submitted for administrative review.',
        dispute
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  markReadyForPickup,
  assignDelivery,
  updateCheckpoint,
  confirmCodPayment,
  markDelivered,
  cancelOrder
};
