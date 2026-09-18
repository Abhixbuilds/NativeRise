const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: 'items.productId',
      populate: {
        path: 'sellerId',
        select: 'businessName category verificationStatus'
      }
    });

    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }

    // Filter out any items whose product was deleted
    const validItems = cart.items.filter(item => item.productId && item.productId.isActive);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const reqQty = Math.max(1, Number(quantity));

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found or unavailable' }
      });
    }

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ customerId: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    const existingQty = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
    const totalDesiredQty = existingQty + reqQty;

    // Available stock = stock - reservedStock + (previously reserved by this user for this item)
    const availableStock = product.stock - product.reservedStock + existingQty;

    if (totalDesiredQty > availableStock) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'OUT_OF_STOCK',
          message: `Only ${Math.max(0, availableStock)} unit(s) available for this product`
        }
      });
    }

    // 10 minutes reservation window (§7.2)
    const reservedUntil = new Date(Date.now() + 10 * 60 * 1000);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = totalDesiredQty;
      cart.items[existingIndex].reservedUntil = reservedUntil;
    } else {
      cart.items.push({ productId, quantity: reqQty, reservedUntil });
    }

    // Update product reservedStock
    product.reservedStock = (product.reservedStock || 0) + reqQty;
    await product.save();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: {
        path: 'sellerId',
        select: 'businessName category'
      }
    });

    res.status(200).json({
      success: true,
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const targetQty = Number(quantity);

    let cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: { code: 'CART_NOT_FOUND', message: 'Cart not found' }
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'ITEM_NOT_IN_CART', message: 'Item not in cart' }
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).json({ success: true, data: { cart } });
    }

    const currentQty = cart.items[itemIndex].quantity;

    if (targetQty <= 0) {
      // Remove item
      product.reservedStock = Math.max(0, (product.reservedStock || 0) - currentQty);
      await product.save();
      cart.items.splice(itemIndex, 1);
    } else {
      const diff = targetQty - currentQty;
      const available = product.stock - (product.reservedStock || 0) + currentQty;

      if (targetQty > available) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'OUT_OF_STOCK',
            message: `Only ${Math.max(0, available)} units available`
          }
        });
      }

      product.reservedStock = Math.max(0, (product.reservedStock || 0) + diff);
      await product.save();

      cart.items[itemIndex].quantity = targetQty;
      cart.items[itemIndex].reservedUntil = new Date(Date.now() + 10 * 60 * 1000);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: {
        path: 'sellerId',
        select: 'businessName category'
      }
    });

    res.status(200).json({
      success: true,
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: { code: 'CART_NOT_FOUND', message: 'Cart not found' }
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const qty = cart.items[itemIndex].quantity;
      const product = await Product.findById(productId);
      if (product) {
        product.reservedStock = Math.max(0, (product.reservedStock || 0) - qty);
        await product.save();
      }
      cart.items.splice(itemIndex, 1);
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      populate: {
        path: 'sellerId',
        select: 'businessName category'
      }
    });

    res.status(200).json({
      success: true,
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
