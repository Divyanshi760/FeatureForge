const Issue = require('../models/Issue');
const User = require('../models/User');

const occupyDeveloper = (developer, issueId) =>
  User.findOneAndUpdate(
    { $or: [{ email: developer.email }, { name: developer.name }] },
    { status: 'occupied', currentIssue: issueId, $inc: { activeIssues: 1 } }
  );

exports.list = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, reportedBy } = req.body;
    const count = await Issue.countDocuments();
    const reporter = {
      id: reportedBy?.id || 'anon',
      name: reportedBy?.name || 'Anonymous User',
      email: reportedBy?.email || '',
    };

    const issue = await Issue.create({
      id: `ISS-${String(count + 1).padStart(3, '0')}`,
      title,
      description,
      reportCount: 1,
      reporters: [reporter],
      reportedBy: reportedBy || { name: 'Anonymous User' },
      status: 'open',
    });

    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upvote = async (req, res) => {
  try {
    const { reporter } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Priority reflects distinct reporters, so one person counts once.
    const alreadyReported =
      reporter &&
      issue.reporters.some(
        (r) =>
          (reporter.id && r.id === reporter.id) ||
          (reporter.email && r.email === reporter.email)
      );
    if (alreadyReported) {
      return res.status(409).json({ message: 'You have already reported this issue' });
    }

    issue.reportCount += 1;
    if (reporter) {
      issue.reporters.push({
        id: reporter.id || 'anon',
        name: reporter.name || 'Anonymous User',
        email: reporter.email || '',
        reportedAt: new Date(),
      });
    }

    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assign = async (req, res) => {
  try {
    const { developer } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.assignedTo = developer;
    issue.assignmentType = 'admin_assigned';
    issue.adminApproved = true;
    issue.status = 'assigned';
    issue.selfPickRequest = null;
    await issue.save();

    await occupyDeveloper(developer, issue.id);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.selfPick = async (req, res) => {
  try {
    const { developer } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.selfPickRequest = { requestedBy: developer, requestedAt: new Date() };
    await issue.save();

    res.json({ message: 'Self-pick request submitted for admin approval', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveSelfPick = async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (!issue.selfPickRequest?.requestedBy) {
      return res.status(400).json({ message: 'No self-pick request pending for this issue' });
    }

    const developer = issue.selfPickRequest.requestedBy;
    issue.assignedTo = developer;
    issue.assignmentType = 'self_picked';
    issue.adminApproved = true;
    issue.status = 'in_progress';
    issue.selfPickRequest = null;
    await issue.save();

    await occupyDeveloper(developer, issue.id);
    res.json({ message: 'Self-pick approved successfully', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectSelfPick = async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.selfPickRequest = null;
    await issue.save();

    res.json({ message: 'Self-pick request rejected', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    await issue.save();

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
};
