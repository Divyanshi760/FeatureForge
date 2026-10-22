const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/issues', require('./issues'));
router.use('/developers', require('./developers'));
router.use('/flags', require('./flags'));
router.use('/approvals', require('./approvals'));
router.use('/audit', require('./audit'));
router.use('/breakglass', require('./breakglass'));
router.use('/experiments', require('./experiments'));
router.use('/rollouts', require('./rollouts'));
router.use('/settings', require('./settings'));

module.exports = router;
