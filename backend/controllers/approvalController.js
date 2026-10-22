const Approval = require('../models/Approval');
const { writeAudit } = require('../lib/audit');

exports.list = async (req, res) => {
  try {
    const approvals = await Approval.find().sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Record a reviewer's approval; apply once the required count is reached.
exports.approve = async (req, res) => {
  try {
    const cr = await Approval.findOne({ id: req.params.id });
    if (!cr) return res.status(404).json({ message: 'Change request not found' });
    if (cr.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer pending' });
    }

    const actor = req.user.email;
    const before = cr.status;
    if (!cr.approvals.includes(actor)) cr.approvals.push(actor);
    if (cr.approvals.length >= cr.needed) cr.status = 'approved';
    await cr.save();

    await writeAudit({
      action: 'approval',
      actor,
      flag: cr.flag,
      key: cr.key,
      env: cr.env,
      summary:
        cr.status === 'approved'
          ? `${cr.id} approved and applied after reaching ${cr.needed} approvals.`
          : `Approval recorded on ${cr.id} (${cr.approvals.length} of ${cr.needed}).`,
      diff: [{ field: 'status', before, after: cr.status }],
      note: `Reviewers: ${cr.approvals.join(', ')}`,
    });

    res.json(cr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject a change request so no change is applied.
exports.reject = async (req, res) => {
  try {
    const cr = await Approval.findOne({ id: req.params.id });
    if (!cr) return res.status(404).json({ message: 'Change request not found' });
    if (cr.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer pending' });
    }

    const actor = req.user.email;
    cr.status = 'rejected';
    await cr.save();

    await writeAudit({
      action: 'approval',
      actor,
      flag: cr.flag,
      key: cr.key,
      env: cr.env,
      summary: `${cr.id} rejected. No change was applied.`,
      diff: [{ field: 'status', before: 'pending', after: 'rejected' }],
      note: req.body?.note || `Rejected by ${actor}`,
    });

    res.json(cr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
