const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestFromImage,
  repeatListing,
  translateProductDescription
} = require('../controllers/productController');

// Public endpoints
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/translate', translateProductDescription);

// Seller protected endpoints
router.post('/', authenticate, roleCheck(['seller', 'admin']), createProduct);
router.put('/:id', authenticate, roleCheck(['seller', 'admin']), updateProduct);
router.delete('/:id', authenticate, roleCheck(['seller', 'admin']), deleteProduct);
router.post('/suggest-from-image', authenticate, roleCheck(['seller', 'admin']), upload.array('images', 5), suggestFromImage);
router.post('/:id/repeat', authenticate, roleCheck(['seller', 'admin']), repeatListing);

module.exports = router;
