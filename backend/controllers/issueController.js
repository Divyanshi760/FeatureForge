const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
    const { developer, estimatedDays } = req.body;
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const days = estimatedDays ? Number(estimatedDays) : null;
    issue.assignedTo = {
      id: developer.id || developer._id,
      name: developer.name,
      email: developer.email,
      estimatedDays: days,
    };
    issue.estimatedDays = days;
    issue.assignmentType = 'admin_assigned';
    issue.adminApproved = true;
    issue.status = 'assigned';

    // Notify any other developers who had requested this issue
    const otherRequests = (issue.requests || []).filter(
      (r) => r.status === 'pending' && r.developer?.email !== developer.email
    );

    for (const other of otherRequests) {
      other.status = 'rejected';
      if (other.developer?.email) {
        await Notification.create({
          recipient: {
            id: other.developer.id,
            name: other.developer.name,
            email: other.developer.email,
          },
          type: 'issue_assignment_update',
          title: `Issue ${issue.id} Assigned to ${developer.name}`,
          message: `${developer.name} was assigned to "${issue.title}". You can pick and solve other available issues from the pool!`,
          issueId: issue.id,
          issueTitle: issue.title,
          assignedTo: {
            id: developer.id || developer._id,
            name: developer.name,
            email: developer.email,
            estimatedDays: days,
          },
          actionUrl: '/developer/available',
          actionText: 'Pick Other Issues',
        });
      }
    }

    // Mark matching request as assigned if developer had requested it
    const selfReq = (issue.requests || []).find((r) => r.developer?.email === developer.email);
    if (selfReq) selfReq.status = 'assigned';

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
    const { developer, estimatedDays, note } = req.body;
    if (!developer) return res.status(400).json({ message: 'Developer information is required' });

    const days = Number(estimatedDays);
    if (!days || days < 1) {
      return res.status(400).json({ message: 'Estimated days to solve is required and must be at least 1 day' });
    }

    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (issue.status !== 'open' || issue.assignedTo) {
      return res.status(400).json({ message: 'This issue is already assigned or closed' });
    }

    if (!issue.requests) {
      issue.requests = [];
    }

    const devEmail = developer.email?.toLowerCase();
    const existingIndex = issue.requests.findIndex(
      (r) =>
        r.developer &&
        ((r.developer.email && r.developer.email.toLowerCase() === devEmail) ||
          (r.developer.id && r.developer.id === (developer.id || developer._id)))
    );

    const devPayload = {
      id: developer.id || developer._id || 'dev',
      name: developer.name,
      email: developer.email,
    };

    if (existingIndex >= 0) {
      issue.requests[existingIndex].estimatedDays = days;
      if (note !== undefined) issue.requests[existingIndex].note = note;
      issue.requests[existingIndex].requestedAt = new Date();
      issue.requests[existingIndex].status = 'pending';
    } else {
      issue.requests.push({
        developer: devPayload,
        estimatedDays: days,
        note: note || '',
        requestedAt: new Date(),
        status: 'pending',
      });
    }

    // Populate backward-compatible selfPickRequest
    const pendingReq = issue.requests.find((r) => r.status === 'pending');
    issue.selfPickRequest = pendingReq
      ? {
          requestedBy: pendingReq.developer,
          estimatedDays: pendingReq.estimatedDays,
          note: pendingReq.note,
          requestedAt: pendingReq.requestedAt,
        }
      : null;

    await issue.save();

    res.json({
      message: 'Self-pick request submitted with estimated days for admin review',
      issue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveSelfPick = async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Allow professor to specify which developer to approve
    const targetEmail = (req.body?.developerEmail || req.body?.email || '')?.toLowerCase();
    const targetId = req.body?.developerId || req.body?.id;

    let targetRequest = null;
    if (targetEmail || targetId) {
      targetRequest = (issue.requests || []).find(
        (r) =>
          r.status === 'pending' &&
          ((targetEmail && r.developer?.email?.toLowerCase() === targetEmail) ||
            (targetId && r.developer?.id === targetId))
      );
    }

    if (!targetRequest && issue.requests && issue.requests.length > 0) {
      targetRequest = issue.requests.find((r) => r.status === 'pending') || issue.requests[0];
    }

    const chosenDev = targetRequest ? targetRequest.developer : issue.selfPickRequest?.requestedBy;
    if (!chosenDev) {
      return res.status(400).json({ message: 'No self-pick request pending for this issue' });
    }

    const estimatedDays = targetRequest?.estimatedDays || issue.selfPickRequest?.estimatedDays || null;

    issue.assignedTo = {
      id: chosenDev.id,
      name: chosenDev.name,
      email: chosenDev.email,
      estimatedDays,
    };
    issue.estimatedDays = estimatedDays;
    issue.assignmentType = 'self_picked';
    issue.adminApproved = true;
    issue.status = 'in_progress';

    if (targetRequest) {
      targetRequest.status = 'assigned';
    }

    // Identify other developers who requested the same issue
    const otherRequests = (issue.requests || []).filter(
      (r) =>
        r.status === 'pending' &&
        r.developer?.email?.toLowerCase() !== chosenDev.email?.toLowerCase()
    );

    for (const other of otherRequests) {
      other.status = 'rejected';
      if (other.developer?.email) {
        await Notification.create({
          recipient: {
            id: other.developer.id,
            name: other.developer.name,
            email: other.developer.email,
          },
          type: 'issue_assignment_update',
          title: `Issue ${issue.id} Assigned to ${chosenDev.name}`,
          message: `${chosenDev.name} was assigned to "${issue.title}"${
            estimatedDays ? ` (Estimated completion: ${estimatedDays} day${estimatedDays > 1 ? 's' : ''})` : ''
          }. You can pick and solve other available issues from the pool!`,
          issueId: issue.id,
          issueTitle: issue.title,
          assignedTo: {
            id: chosenDev.id,
            name: chosenDev.name,
            email: chosenDev.email,
            estimatedDays,
          },
          actionUrl: '/developer/available',
          actionText: 'Pick Other Issues',
        });
      }
    }

    // Also send an assignment confirmation notification to the chosen developer
    if (chosenDev.email) {
      await Notification.create({
        recipient: {
          id: chosenDev.id,
          name: chosenDev.name,
          email: chosenDev.email,
        },
        type: 'issue_assigned',
        title: `Assigned: ${issue.id} - ${issue.title}`,
        message: `Your request was approved by the professor. Target completion: ${
          estimatedDays ? `${estimatedDays} day${estimatedDays > 1 ? 's' : ''}` : 'As scheduled'
        }. Happy coding!`,
        issueId: issue.id,
        issueTitle: issue.title,
        actionUrl: '/developer/my-issues',
        actionText: 'View My Issues',
      });
    }

    issue.selfPickRequest = null;
    await issue.save();

    await occupyDeveloper(chosenDev, issue.id);
    res.json({
      message: `Self-pick approved successfully for ${chosenDev.name}`,
      issue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectSelfPick = async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const targetEmail = (req.body?.developerEmail || req.body?.email || '')?.toLowerCase();
    const targetId = req.body?.developerId || req.body?.id;

    if (targetEmail || targetId) {
      const target = (issue.requests || []).find(
        (r) =>
          (targetEmail && r.developer?.email?.toLowerCase() === targetEmail) ||
          (targetId && r.developer?.id === targetId)
      );
      if (target) {
        target.status = 'rejected';
        if (target.developer?.email) {
          await Notification.create({
            recipient: {
              id: target.developer.id,
              name: target.developer.name,
              email: target.developer.email,
            },
            type: 'self_pick_rejected',
            title: `Request Declined for ${issue.id}`,
            message: `Your request for "${issue.title}" was not approved by the professor. You can pick and solve other available issues from the pool!`,
            issueId: issue.id,
            issueTitle: issue.title,
            actionUrl: '/developer/available',
            actionText: 'Pick Other Issues',
          });
        }
      }
    } else {
      for (const r of (issue.requests || []).filter((req) => req.status === 'pending')) {
        r.status = 'rejected';
        if (r.developer?.email) {
          await Notification.create({
            recipient: {
              id: r.developer.id,
              name: r.developer.name,
              email: r.developer.email,
            },
            type: 'self_pick_rejected',
            title: `Request Declined for ${issue.id}`,
            message: `Your request for "${issue.title}" was not approved by the professor. You can pick and solve other available issues from the pool!`,
            issueId: issue.id,
            issueTitle: issue.title,
            actionUrl: '/developer/available',
            actionText: 'Pick Other Issues',
          });
        }
      }
    }

    const remainingPending = (issue.requests || []).find((r) => r.status === 'pending');
    issue.selfPickRequest = remainingPending
      ? {
          requestedBy: remainingPending.developer,
          estimatedDays: remainingPending.estimatedDays,
          note: remainingPending.note,
          requestedAt: remainingPending.requestedAt,
        }
      : null;

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
