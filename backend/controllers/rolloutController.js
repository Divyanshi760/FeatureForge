const Rollout = require('../models/Rollout');
const Flag = require('../models/Flag');
const { writeAudit } = require('../lib/audit');

exports.list = async (req, res) => {
  try {
    const rollouts = await Rollout.find();
    res.json(rollouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Faked guarded rollback: no live stats engine. "Simulate bad metric" marks the
// rollout rolled_back, records the breach, disables the linked flag, and writes
// the auto_rollback entry the guard job would have written.
exports.simulateRollback = async (req, res) => {
  try {
    const rollout = await Rollout.findOne({ id: req.params.id });
    if (!rollout) return res.status(404).json({ message: 'Rollout not found' });

    const m = rollout.metric || {};
    const beforeRamp = rollout.rollout;
    rollout.trend = 'rolled_back';
    rollout.rollout = 0;
    rollout.startedLabel = 'disabled just now';
    rollout.rollbacks = [
      {
        at: 'just now',
        reason:
          req.body?.reason ||
          `${m.label || 'Metric'} breached the ${m.threshold ?? ''}${m.unit || ''} threshold for ${m.windowsToRollback || 2} consecutive windows.`,
        detail: 'The flag was disabled and the new config pushed to every SDK.',
      },
      ...rollout.rollbacks,
    ];
    await rollout.save();

    const flag = await Flag.findOne({ key: rollout.key });
    if (flag) {
      flag.on = false;
      flag.rollout = 0;
      flag.when = 'just now';
      await flag.save();
    }

    await writeAudit({
      action: 'auto_rollback',
      actor: 'system',
      system: true,
      flag: rollout.flag,
      key: rollout.key,
      env: rollout.env,
      summary: `Auto-rollback fired on ${rollout.flag}`,
      diff: [
        { field: 'state', before: 'on', after: 'off' },
        { field: 'rolloutPercent', before: String(beforeRamp), after: '0' },
      ],
    });

    res.json({ rollout, flag });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
