const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ customerId: req.user._id }).populate({
      path: 'products',
      populate: { path: 'sellerId', select: 'businessName category rating' }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ customerId: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PRODUCT_ID', message: 'Product ID required' }
      });
    }

    let wishlist = await Wishlist.findOne({ customerId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ customerId: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(p => p.toString() === productId);
    let action = 'added';

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'sellerId', select: 'businessName category rating' }
    });

    res.status(200).json({
      success: true,
      data: {
        action,
        wishlist: populated
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, toggleWishlist };
