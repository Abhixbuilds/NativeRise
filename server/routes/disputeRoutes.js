const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const {
  getDisputes,
  createDispute,
  uploadVoiceNote,
  updateTrustCircleReview,
  resolveDispute
} = require('../controllers/disputeController');

router.get('/', authenticate, getDisputes);
router.post('/', authenticate, createDispute);
router.post('/voice-note', authenticate, upload.single('audio'), uploadVoiceNote);
router.put('/:id/trust-circle-review', authenticate, roleCheck(['admin']), updateTrustCircleReview);
router.put('/:id/resolve', authenticate, roleCheck(['admin']), resolveDispute);

module.exports = router;
