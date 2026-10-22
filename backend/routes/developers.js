const express = require('express');
const router = express.Router();
const developers = require('../controllers/developerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', developers.list);
router.patch('/me/status', authorize('developer'), developers.updateMyStatus);
router.patch('/:id/status', authorize('admin'), developers.updateStatus);

module.exports = router;
