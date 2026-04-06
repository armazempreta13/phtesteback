const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const adminController = require('../controllers/admin.controller');

router.get('/stats', [auth, admin], adminController.getStats);

module.exports = router;
