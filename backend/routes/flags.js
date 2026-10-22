const express = require('express');
const router = express.Router();
const flags = require('../controllers/flagController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', flags.list);
router.post('/', authorize('admin'), flags.create);
router.patch('/:key/toggle', authorize('admin'), flags.toggle);
router.patch('/:key/rollout', authorize('admin'), flags.updateRollout);
router.post('/:key/rollback', authorize('admin'), flags.rollback);

module.exports = router;
