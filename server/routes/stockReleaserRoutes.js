// server/routes/stockReleaserRoutes.js
const express = require('express');
const router = express.Router();
const { releaseExpiredReservations } = require('../controllers/stockReleaserController');

// GET /api/stock-releaser - trigger manual release (admin use)
router.get('/', releaseExpiredReservations);

module.exports = router;
