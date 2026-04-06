const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const clientController = require('../controllers/client.controller');

// Client can access their own projects and messages
router.get('/projects', auth, clientController.getClientProjects);
router.get('/projects/:id', auth, clientController.getClientProject);
router.get('/projects/:id/messages', auth, clientController.getMessages);
router.post('/projects/:id/messages', auth, clientController.sendMessage);

module.exports = router;
