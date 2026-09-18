const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');
const Order = require('../models/Order');

const getAssignments = async (req, res, next) => {
  try {
    const dp = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
    if (!dp) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Delivery partner profile required' } });
    }

    const [assignedOrders, unassignedReadyOrders] = await Promise.all([
      Order.find({ deliveryPartnerId: dp._id })
        .populate('customerId', 'name email phone address')
        .populate({ path: 'sellerId', populate: { path: 'userId', select: 'name phone address' } })
        .populate('paymentId')
        .sort({ updatedAt: -1 }),
      Order.find({ status: 'ready_for_pickup', deliveryPartnerId: null })
        .populate('customerId', 'name email phone address')
        .populate({ path: 'sellerId', populate: { path: 'userId', select: 'name phone address' } })
        .populate('paymentId')
        .sort({ createdAt: -1 })
    ]);

    const newAssignments = [
      ...unassignedReadyOrders,
      ...assignedOrders.filter(o => o.status === 'picked_up')
    ];
    const activeAssignments = assignedOrders.filter(o => o.status === 'in_transit');
    const completedAssignments = assignedOrders.filter(o => o.status === 'delivered');

    res.status(200).json({
      success: true,
      data: {
        profile: dp,
        assignments: {
          new: newAssignments,
          active: activeAssignments,
          completed: completedAssignments
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNearbyPickups = async (req, res, next) => {
  try {
    const dp = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
    if (!dp) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Delivery partner profile required' } });
    }

    // Backhaul return-trip load optimization (§7.12)
    // Find unassigned orders ready for pickup or accepted
    const nearbyOrders = await Order.find({
      status: { $in: ['ready_for_pickup', 'accepted'] },
      deliveryPartnerId: { $ne: dp._id }
    })
      .populate({
        path: 'sellerId',
        select: 'businessName category trustCircleVouchedBy userId',
        populate: { path: 'userId', select: 'name address' }
      })
      .populate('customerId', 'name address')
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        currentZone: dp.serviceZone,
        hubLocation: dp.activeHubLocation,
        nearbyPickups: nearbyOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateDeliveryProfile = async (req, res, next) => {
  try {
    const { serviceZone, vehicleType, activeHubLocation } = req.body;
    const dp = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
    if (!dp) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Delivery partner profile required' } });
    }

    if (serviceZone) dp.serviceZone = serviceZone;
    if (vehicleType) dp.vehicleType = vehicleType;
    if (activeHubLocation) dp.activeHubLocation = activeHubLocation;

    await dp.save();

    res.status(200).json({
      success: true,
      data: { profile: dp }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAssignments, getNearbyPickups, updateDeliveryProfile };
