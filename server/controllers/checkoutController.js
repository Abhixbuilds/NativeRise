const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const SellerProfile = require('../models/SellerProfile');
const { calculateDeliveryFee } = require('../services/delivery-fee-calculator');
const { calculateProfitBreakdown } = require('../services/profit-calculator');
const { checkSeasonalDelay } = require('../services/seasonal-delay');
const { createOrder: createRazorpayOrder, verifySignature, keyId } = require('../config/razorpay');
const { emitToUser, emitToRole, broadcastEvent } = require('../config/socket');

const estimateDelivery = async (req, res, next) => {
  try {
    const { customerAddress = {} } = req.body;
    const cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: 'items.productId',
      populate: { path: 'sellerId', populate: { path: 'userId' } }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'CART_EMPTY', message: 'Cart is empty' }
      });
    }

    // Group items by seller
    const sellerMap = {};
    for (const item of cart.items) {
      if (!item.productId) continue;
      const sId = item.productId.sellerId._id.toString();
      if (!sellerMap[sId]) {
        sellerMap[sId] = {
          sellerId: sId,
          sellerName: item.productId.sellerId.businessName,
          totalWeight: 0,
          items: []
        };
      }
      sellerMap[sId].totalWeight += (item.productId.weightGrams || 500) * item.quantity;
      sellerMap[sId].items.push(item);
    }

    const destinationState = customerAddress.state || 'Maharashtra';
    const seasonalCheck = checkSeasonalDelay(destinationState);

    const estimatesBySeller = Object.values(sellerMap).map(sellerGroup => {
      // Approximate distance (120-220km for regional rural hubs)
      const distanceKm = 145;
      const feeResult = calculateDeliveryFee({
        distanceKm,
        weightGrams: sellerGroup.totalWeight
      });

      const baseEtaDays = 3;
      const totalEtaDays = baseEtaDays + seasonalCheck.extraDays;

      return {
        sellerId: sellerGroup.sellerId,
        sellerName: sellerGroup.sellerName,
        distanceKm,
        deliveryCost: feeResult.totalFee,
        etaDays: totalEtaDays,
        weatherAdjustedDelay: seasonalCheck.weatherAdjustedDelay,
        seasonalNote: seasonalCheck.reason
      };
    });

    const totalDeliveryCost = estimatesBySeller.reduce((acc, curr) => acc + curr.deliveryCost, 0);

    res.status(200).json({
      success: true,
      data: {
        estimatesBySeller,
        totalDeliveryCost,
        weatherAdjustedDelay: seasonalCheck.weatherAdjustedDelay,
        seasonalNote: seasonalCheck.reason
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCheckoutOrder = async (req, res, next) => {
  try {
    const { paymentMode = 'online', customerAddress = {} } = req.body;
    const cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: 'items.productId',
      populate: { path: 'sellerId' }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'CART_EMPTY', message: 'Cart is empty' }
      });
    }

    // Check stock availability for all items before initiating payment
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product || product.stock < item.quantity) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'OUT_OF_STOCK',
            message: `Product "${product ? product.name : 'Unknown'}" is no longer available in requested quantity`
          }
        });
      }
    }

    // Calculate subtotal & delivery fee per seller
    let subtotal = 0;
    const sellerMap = {};
    for (const item of cart.items) {
      const p = item.productId;
      subtotal += p.price * item.quantity;
      const sId = p.sellerId._id.toString();
      if (!sellerMap[sId]) {
        sellerMap[sId] = { totalWeight: 0 };
      }
      sellerMap[sId].totalWeight += (p.weightGrams || 500) * item.quantity;
    }

    let totalDeliveryFee = 0;
    Object.values(sellerMap).forEach(s => {
      const fee = calculateDeliveryFee({ distanceKm: 145, weightGrams: s.totalWeight });
      totalDeliveryFee += fee.totalFee;
    });

    const grandTotal = subtotal + totalDeliveryFee;

    if (paymentMode === 'cod') {
      return res.status(200).json({
        success: true,
        data: {
          paymentMode: 'cod',
          amount: grandTotal,
          currency: 'INR'
        }
      });
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(grandTotal * 100),
      currency: 'INR',
      receipt: `rcpt_${req.user._id}_${Date.now()}`
    });

    res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        keyId,
        grandTotalINR: grandTotal
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyPaymentAndCreateOrders = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMode = 'online',
      shippingAddress
    } = req.body;

    if (paymentMode === 'online') {
      const isValid = verifySignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_SIGNATURE', message: 'Payment verification failed' }
        });
      }
    }

    const cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: 'items.productId',
      populate: { path: 'sellerId', populate: { path: 'userId' } }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'CART_EMPTY', message: 'No items in cart to checkout' }
      });
    }

    // Group items by seller to perform SPLIT-ORDER logic (§7.1)
    const sellerGroups = {};
    for (const item of cart.items) {
      const prod = item.productId;
      if (!prod) continue;
      const sellerIdStr = prod.sellerId._id.toString();

      if (!sellerGroups[sellerIdStr]) {
        sellerGroups[sellerIdStr] = {
          seller: prod.sellerId,
          items: [],
          totalWeight: 0,
          totalPrice: 0,
          totalProductCost: 0,
          totalPackagingCost: 0
        };
      }

      sellerGroups[sellerIdStr].items.push({
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity
      });

      sellerGroups[sellerIdStr].totalWeight += (prod.weightGrams || 500) * item.quantity;
      sellerGroups[sellerIdStr].totalPrice += prod.price * item.quantity;
      sellerGroups[sellerIdStr].totalProductCost += (prod.productCost || 0) * item.quantity;
      sellerGroups[sellerIdStr].totalPackagingCost += (prod.packagingCost || 0) * item.quantity;
    }

    // Calculate total amount across all seller orders
    let totalOrderAmount = 0;
    const destinationState = shippingAddress?.state || req.user.address?.state || 'Maharashtra';
    const seasonal = checkSeasonalDelay(destinationState);

    const calculatedSellerOrders = [];

    for (const sellerIdStr of Object.keys(sellerGroups)) {
      const group = sellerGroups[sellerIdStr];
      const deliveryCalc = calculateDeliveryFee({
        distanceKm: 145,
        weightGrams: group.totalWeight
      });

      const profitBreakdown = calculateProfitBreakdown({
        sellingPrice: group.totalPrice,
        productCost: group.totalProductCost,
        packagingCost: group.totalPackagingCost,
        deliveryCost: deliveryCalc.totalFee
      });

      const etaDate = new Date();
      etaDate.setDate(etaDate.getDate() + 3 + seasonal.extraDays);

      totalOrderAmount += group.totalPrice + deliveryCalc.totalFee;

      calculatedSellerOrders.push({
        sellerId: group.seller._id,
        sellerUserId: group.seller.userId?._id,
        items: group.items,
        deliveryCost: deliveryCalc.totalFee,
        profitBreakdown,
        etaEstimate: etaDate,
        weatherAdjustedDelay: seasonal.weatherAdjustedDelay
      });
    }

    // Create ONE Payment document referencing all linked orders (§7.1)
    const payment = await Payment.create({
      razorpayOrderId: razorpay_order_id || `cod_${Date.now()}`,
      razorpayPaymentId: razorpay_payment_id || `cod_pay_${Date.now()}`,
      amount: totalOrderAmount,
      status: paymentMode === 'online' ? 'received' : 'pending',
      paymentMode,
      linkedOrders: []
    });

    const createdOrders = [];

    // Create one Order per distinct seller
    for (const orderData of calculatedSellerOrders) {
      const order = await Order.create({
        customerId: req.user._id,
        sellerId: orderData.sellerId,
        items: orderData.items,
        paymentId: payment._id,
        status: 'placed',
        deliveryCost: orderData.deliveryCost,
        checkpoints: [
          {
            location: 'Seller Workshop',
            status: 'ORDER_PLACED',
            timestamp: new Date(),
            updatedBy: req.user._id
          }
        ],
        etaEstimate: orderData.etaEstimate,
        weatherAdjustedDelay: orderData.weatherAdjustedDelay,
        profitBreakdown: orderData.profitBreakdown
      });

      createdOrders.push(order);
      payment.linkedOrders.push(order._id);

      // Decrement stock & reservedStock on purchased products permanently (§7.2)
      for (const it of orderData.items) {
        await Product.findByIdAndUpdate(it.productId, {
          $inc: { stock: -it.quantity, reservedStock: -it.quantity }
        });
      }

      // Notify relevant seller via Socket.io & Notification collection (§9)
      if (orderData.sellerUserId) {
        emitToUser(orderData.sellerUserId.toString(), 'order:created', {
          orderId: order._id,
          items: order.items,
          status: 'placed'
        });

        await Notification.create({
          userId: orderData.sellerUserId,
          title: 'New Order Received',
          message: `You have received a new order #${order._id.toString().slice(-6)} for ₹${order.profitBreakdown?.actualProfit || 0} profit.`
        });
      }
    }

    await payment.save();

    // Clear customer cart
    cart.items = [];
    await cart.save();

    // Broadcast payment status changed
    emitToUser(req.user._id.toString(), 'payment:status-changed', {
      paymentId: payment._id,
      status: payment.status
    });

    // Notify Admins of new order placement
    emitToRole('admin', 'order:created', {
      paymentId: payment._id,
      orderCount: createdOrders.length,
      totalAmount: totalOrderAmount
    });

    res.status(200).json({
      success: true,
      data: {
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          paymentMode: payment.paymentMode
        },
        orders: createdOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' }
      });
    }

    payment.status = 'refunded';
    await payment.save();

    emitToRole('admin', 'payment:status-changed', { paymentId: payment._id, status: 'refunded' });

    res.status(200).json({
      success: true,
      data: { payment: { id: payment._id, status: 'refunded' } }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  estimateDelivery,
  createCheckoutOrder,
  verifyPaymentAndCreateOrders,
  refundPayment
};
