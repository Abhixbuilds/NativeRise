const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const DeliveryPartnerProfile = require('../models/DeliveryPartnerProfile');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;

    if (user.role === 'seller') {
      profile = await SellerProfile.findOne({ userId: user._id });
    } else if (user.role === 'delivery') {
      profile = await DeliveryPartnerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        address: user.address,
        profileImage: user.profileImage,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const updateLanguage = async (req, res, next) => {
  try {
    const { preferredLanguage } = req.body;
    const validLanguages = ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa'];

    if (!validLanguages.includes(preferredLanguage)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_LANGUAGE', message: 'Language code not supported' }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredLanguage },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: { preferredLanguage: user.preferredLanguage }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, updateLanguage };
