const express = require('express');
const router = express.Router();
const flags = require('../controllers/flagController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', flags.list);
router.patch('/:key/toggle', authorize('admin'), flags.toggle);

module.exports = router;
