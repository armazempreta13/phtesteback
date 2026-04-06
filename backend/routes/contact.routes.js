const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const contactController = require('../controllers/contact.controller');

router.post('/', contactController.submitContact);
router.get('/', [auth, admin], contactController.listMessages);
router.put('/:id', [auth, admin], contactController.updateMessageStatus);

module.exports = router;
