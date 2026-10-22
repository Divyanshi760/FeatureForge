const express = require('express');
const router = express.Router();
const approvals = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/', approvals.list);
router.post('/:id/approve', approvals.approve);
router.post('/:id/reject', approvals.reject);

module.exports = router;
