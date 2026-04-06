const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const briefingsController = require('../controllers/briefings.controller');

router.post('/', briefingsController.createBriefing);
router.get('/', auth, briefingsController.listBriefings);
router.get('/:id', auth, briefingsController.getBriefing);

// Admin-only status update
router.put('/:id/status', [auth, admin], briefingsController.updateBriefingStatus);

module.exports = router;
