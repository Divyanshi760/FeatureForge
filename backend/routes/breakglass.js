const express = require('express');
const router = express.Router();
const breakglass = require('../controllers/breakglassController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/', breakglass.list);

module.exports = router;
