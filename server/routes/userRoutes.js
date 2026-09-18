const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getMe, updateMe, updateLanguage } = require('../controllers/userController');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.put('/me/language', authenticate, updateLanguage);

module.exports = router;
