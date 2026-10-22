const express = require('express');
const router = express.Router();
const settings = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/', settings.get);

module.exports = router;
