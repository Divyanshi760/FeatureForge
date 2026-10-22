const express = require('express');
const router = express.Router();
const issues = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', issues.list);
router.post('/', issues.create);
router.post('/:id/upvote', issues.upvote);
router.post('/:id/assign', authorize('admin'), issues.assign);
router.post('/:id/self-pick', authorize('developer'), issues.selfPick);
router.post('/:id/approve', authorize('admin'), issues.approveSelfPick);
router.post('/:id/reject', authorize('admin'), issues.rejectSelfPick);
router.patch('/:id/status', authorize('developer', 'admin'), issues.updateStatus);

module.exports = router;
