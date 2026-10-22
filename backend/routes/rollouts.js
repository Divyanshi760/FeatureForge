const express = require('express');
const router = express.Router();
const rollouts = require('../controllers/rolloutController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', rollouts.list);

module.exports = router;
