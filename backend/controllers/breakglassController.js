const Breakglass = require('../models/Breakglass');
const { writeAudit, nextSeq } = require('../lib/audit');

exports.list = async (req, res) => {
  try {
    const sessions = await Breakglass.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Grant an emergency break-glass session, time-boxed to durationMin.
exports.request = async (req, res) => {
  try {
    const { flag, key, reason, durationMin, env } = req.body;
    if (!flag || !key || !reason || !durationMin) {
      return res.status(400).json({ message: 'flag, key, reason and durationMin are required' });
    }

    const actor = req.user.email;
    const now = Date.now();
    const seq = await nextSeq(Breakglass, 'BG');

    const session = await Breakglass.create({
      id: `BG-${seq}`,
      user: actor,
      flag,
      key,
      env: env || 'prod',
      reason,
      durationMin,
      grantedAt: new Date(now),
      expiresAt: new Date(now + durationMin * 60000),
      status: 'active',
      grantedLabel: 'just now',
      used: 'No changes yet',
    });

    await writeAudit({
      action: 'break_glass',
      actor,
      flag,
      key,
      env: session.env,
      summary: `Break-glass session ${session.id} granted for ${durationMin}m, bypassing approval.`,
      diff: [{ field: 'access', before: 'none', after: `granted · ${durationMin}m` }],
      note: `Reason: "${reason}"`,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Force-revoke an active break-glass session.
exports.revoke = async (req, res) => {
  try {
    const session = await Breakglass.findOne({ id: req.params.id });
    if (!session) return res.status(404).json({ message: 'Break-glass session not found' });
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is not active' });
    }

    const actor = req.user.email;
    session.status = 'revoked';
    session.closedBy = `force-revoked by ${actor}`;
    session.endedLabel = 'just now';
    await session.save();

    await writeAudit({
      action: 'break_glass',
      actor,
      flag: session.flag,
      key: session.key,
      env: session.env,
      summary: `Break-glass session ${session.id} force-revoked. The bypass is closed.`,
      diff: [{ field: 'status', before: 'active', after: 'revoked' }],
      note: `Closed by ${actor}`,
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
