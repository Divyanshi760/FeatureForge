const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Issue = require('../models/Issue');
const Flag = require('../models/Flag');
const Rollout = require('../models/Rollout');
const Approval = require('../models/Approval');
const Experiment = require('../models/Experiment');
const AuditLog = require('../models/AuditLog');
const Breakglass = require('../models/Breakglass');
const Setting = require('../models/Setting');

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

// ==========================================
// 1. AUTH ROUTES
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        specialty: user.specialty,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialty } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
      status: role === 'developer' ? 'free' : 'active',
      specialty: specialty || null,
    });
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. ISSUES ROUTES (Tracking, auto-priority, +1 upvote, assign, self-pick, approve)
// ==========================================
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/issues', async (req, res) => {
  try {
    const { title, description, reportedBy } = req.body;
    const count = await Issue.countDocuments();
    const newId = `ISS-${String(count + 1).padStart(3, '0')}`;

    const newIssue = new Issue({
      id: newId,
      title,
      description,
      reportCount: 1,
      reporters: [
        {
          id: reportedBy?.id || 'anon',
          name: reportedBy?.name || 'Anonymous User',
          email: reportedBy?.email || '',
        },
      ],
      reportedBy: reportedBy || { name: 'Anonymous User' },
      status: 'open',
    });

    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upvote / "+1 I have this issue too"
router.post('/issues/:id/upvote', async (req, res) => {
  try {
    const { reporter } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.reportCount += 1;
    if (reporter) {
      issue.reporters.push({
        id: reporter.id || 'anon',
        name: reporter.name || 'Anonymous User',
        email: reporter.email || '',
        reportedAt: new Date(),
      });
    }

    // Auto-compute priority via pre-save hook
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin assigns issue to a free developer
router.post('/issues/:id/assign', async (req, res) => {
  try {
    const { developer } = req.body; // { id, name, email }
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.assignedTo = developer;
    issue.assignmentType = 'admin_assigned';
    issue.adminApproved = true;
    issue.status = 'assigned';
    issue.selfPickRequest = null;
    await issue.save();

    // Mark developer as occupied
    await User.findOneAndUpdate(
      { $or: [{ email: developer.email }, { name: developer.name }] },
      { status: 'occupied', currentIssue: issue.id, $inc: { activeIssues: 1 } }
    );

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Developer self-picks an issue (needs admin approval)
router.post('/issues/:id/self-pick', async (req, res) => {
  try {
    const { developer } = req.body; // { id, name, email }
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.selfPickRequest = {
      requestedBy: developer,
      requestedAt: new Date(),
    };
    await issue.save();

    res.json({ message: 'Self-pick request submitted for admin approval', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin approves developer self-pick
router.post('/issues/:id/approve', async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (!issue.selfPickRequest?.requestedBy) {
      return res.status(400).json({ message: 'No self-pick request pending for this issue' });
    }

    const dev = issue.selfPickRequest.requestedBy;
    issue.assignedTo = dev;
    issue.assignmentType = 'self_picked';
    issue.adminApproved = true;
    issue.status = 'in_progress';
    issue.selfPickRequest = null;
    await issue.save();

    // Mark developer as occupied
    await User.findOneAndUpdate(
      { $or: [{ email: dev.email }, { name: dev.name }] },
      { status: 'occupied', currentIssue: issue.id, $inc: { activeIssues: 1 } }
    );

    res.json({ message: 'Self-pick approved successfully', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin rejects developer self-pick
router.post('/issues/:id/reject', async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.selfPickRequest = null;
    await issue.save();

    res.json({ message: 'Self-pick request rejected', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update issue status (e.g. resolve or close)
router.patch('/issues/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    await issue.save();

    // If resolved or closed, free up developer
    if ((status === 'resolved' || status === 'closed') && issue.assignedTo) {
      await User.findOneAndUpdate(
        { $or: [{ email: issue.assignedTo.email }, { name: issue.assignedTo.name }] },
        { status: 'free', currentIssue: null, $inc: { activeIssues: -1, resolvedTotal: 1 } }
      );
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. DEVELOPERS ROUTES
// ==========================================
router.get('/developers', async (req, res) => {
  try {
    const devs = await User.find({ role: 'developer' }).select('-password');
    res.json(devs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/developers/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'free' or 'occupied'
    const dev = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    res.json(dev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. FLAGS ROUTES
// ==========================================
router.get('/flags', async (req, res) => {
  try {
    const flags = await Flag.find().sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/flags/:key/toggle', async (req, res) => {
  try {
    const flag = await Flag.findOne({ key: req.params.key });
    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    flag.on = !flag.on;
    flag.rollout = flag.on ? (flag.rollout > 0 ? flag.rollout : 100) : 0;
    await flag.save();
    res.json(flag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 5. ROLLOUTS ROUTES
// ==========================================
router.get('/rollouts', async (req, res) => {
  try {
    const rollouts = await Rollout.find();
    res.json(rollouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 6. APPROVALS / CHANGE REQUESTS ROUTES
// ==========================================
router.get('/approvals', async (req, res) => {
  try {
    const approvals = await Approval.find().sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 7. EXPERIMENTS ROUTES
// ==========================================
router.get('/experiments', async (req, res) => {
  try {
    const experiments = await Experiment.find();
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 8. AUDIT LOG ROUTES
// ==========================================
router.get('/audit', async (req, res) => {
  try {
    const audit = await AuditLog.find().sort({ createdAt: -1 });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 9. BREAK-GLASS ROUTES
// ==========================================
router.get('/breakglass', async (req, res) => {
  try {
    const sessions = await Breakglass.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 10. SETTINGS ROUTES
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
