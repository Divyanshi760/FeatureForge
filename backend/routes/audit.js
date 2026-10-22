const express = require('express');
const router = express.Router();
const audit = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/', audit.list);

module.exports = router;
