const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const settingsController = require('../controllers/settings.controller');

router.get('/', [auth, admin], settingsController.getSettings);
router.put('/', [auth, admin], settingsController.updateSettings);

module.exports = router;
