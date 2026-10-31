const express = require('express');
const router = express.Router();
const notifications = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', notifications.list);
router.patch('/:id/read', notifications.markRead);
router.post('/mark-all-read', notifications.markAllRead);
router.delete('/:id', notifications.deleteNotification);

module.exports = router;
