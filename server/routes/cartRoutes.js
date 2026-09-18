const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');

router.get('/', authenticate, getCart);
router.post('/items', authenticate, addToCart);
router.put('/items/:productId', authenticate, updateCartItem);
router.delete('/items/:productId', authenticate, removeCartItem);

module.exports = router;
