const express = require('express');
const router = express.Router();
const experiments = require('../controllers/experimentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', experiments.list);

module.exports = router;
