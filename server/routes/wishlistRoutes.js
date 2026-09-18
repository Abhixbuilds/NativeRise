const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

router.get('/', authenticate, getWishlist);
router.post('/toggle', authenticate, toggleWishlist);

module.exports = router;
