const express = require('express');
const router = express.Router();
const experiments = require('../controllers/experimentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', experiments.list);
router.post('/', authorize('admin'), experiments.create);

module.exports = router;
