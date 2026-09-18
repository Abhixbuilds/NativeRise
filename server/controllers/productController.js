const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const { suggestProductDetailsFromImage } = require('../services/vision-suggest');
const { translateText } = require('../services/translation');

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sellerId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (sellerId) {
      query.sellerId = sellerId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { descriptionOriginal: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, totalResults] = await Promise.all([
      Product.find(query)
        .populate({
          path: 'sellerId',
          select: 'businessName category rating verificationStatus trustCircleVouchedBy'
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalResults / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: {
        products,
        page: pageNum,
        totalPages,
        totalResults
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'sellerId',
        select: 'businessName businessDescription category rating totalOrders verificationStatus trustCircleVouchedBy userId',
        populate: {
          path: 'userId',
          select: 'name address'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(403).json({
        success: false,
        error: { code: 'NOT_A_SELLER', message: 'Seller profile not found' }
      });
    }

    const {
      name,
      descriptionOriginal,
      originalLanguage = 'en',
      category,
      price,
      productCost = 0,
      packagingCost = 0,
      stock,
      images = [],
      weightGrams = 500,
      dimensions = {},
      provenanceCard = {}
    } = req.body;

    if (!name || !descriptionOriginal || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name, description, category, price, and stock are required' }
      });
    }

    const product = await Product.create({
      sellerId: seller._id,
      name,
      descriptionOriginal,
      originalLanguage,
      category,
      price: Number(price),
      productCost: Number(productCost),
      packagingCost: Number(packagingCost),
      stock: Number(stock),
      images: Array.isArray(images) ? images : [images],
      weightGrams: Number(weightGrams),
      dimensions,
      provenanceCard
    });

    res.status(201).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(403).json({
        success: false,
        error: { code: 'NOT_A_SELLER', message: 'Seller profile not found' }
      });
    }

    const product = await Product.findOne({ _id: req.params.id, sellerId: seller._id });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found or unauthorized' }
      });
    }

    const allowedUpdates = [
      'name', 'descriptionOriginal', 'originalLanguage', 'category', 'price',
      'productCost', 'packagingCost', 'stock', 'images', 'weightGrams',
      'dimensions', 'provenanceCard', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, sellerId: seller._id });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      data: { message: 'Product deactivated successfully' }
    });
  } catch (error) {
    next(error);
  }
};

const suggestFromImage = async (req, res, next) => {
  try {
    const files = req.files || [];
    const imageUrls = files.map(f => `/uploads/${f.filename}`);
    const fallbackCategory = req.body.category || 'Handicrafts';

    const suggestion = suggestProductDetailsFromImage(imageUrls, fallbackCategory);

    res.status(200).json({
      success: true,
      data: {
        ...suggestion,
        uploadedImages: imageUrls
      }
    });
  } catch (error) {
    next(error);
  }
};

const repeatListing = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ userId: req.user._id });
    const original = await Product.findOne({ _id: req.params.id, sellerId: seller._id });

    if (!original) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        template: {
          name: `${original.name} (Copy)`,
          descriptionOriginal: original.descriptionOriginal,
          originalLanguage: original.originalLanguage,
          category: original.category,
          price: '', // left blank per prompt §7.17
          stock: '', // left blank per prompt §7.17
          productCost: original.productCost,
          packagingCost: original.packagingCost,
          weightGrams: original.weightGrams,
          dimensions: original.dimensions,
          images: original.images,
          provenanceCard: original.provenanceCard
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const translateProductDescription = async (req, res, next) => {
  try {
    const { targetLanguage } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    const translatedText = await translateText(
      product.descriptionOriginal,
      product.originalLanguage,
      targetLanguage || 'en'
    );

    res.status(200).json({
      success: true,
      data: {
        originalText: product.descriptionOriginal,
        originalLanguage: product.originalLanguage,
        targetLanguage,
        translatedText
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestFromImage,
  repeatListing,
  translateProductDescription
};
