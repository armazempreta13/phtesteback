const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationsController = require('../controllers/notifications.controller');

router.get('/', auth, notificationsController.listNotifications);
router.get('/unread/count', auth, notificationsController.getUnreadCount);
router.post('/', auth, notificationsController.createNotification);
router.put('/:id/read', auth, notificationsController.markAsRead);
router.put('/mark-all-read', auth, notificationsController.markAllAsRead);

module.exports = router;
