const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const analyticsController = require('../controllers/analytics.controller');

// Track event - public (called from frontend on page load)
router.post('/track', analyticsController.trackEvent);

// Get analytics - admin only
router.get('/', [auth, admin], analyticsController.getAnalytics);

module.exports = router;
