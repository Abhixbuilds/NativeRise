const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createReview, getReviews } = require('../controllers/reviewController');

router.get('/', getReviews);
router.post('/', authenticate, createReview);

module.exports = router;
