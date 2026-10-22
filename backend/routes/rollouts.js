const express = require('express');
const router = express.Router();
const rollouts = require('../controllers/rolloutController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', rollouts.list);
router.post('/:id/rollback', authorize('admin'), rollouts.simulateRollback);

module.exports = router;
