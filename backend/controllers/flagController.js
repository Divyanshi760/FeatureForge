const Flag = require('../models/Flag');
const { writeAudit } = require('../lib/audit');

// Governed flags log a config_change; ops flags toggle under ops_toggle.
const auditAction = (type) => (type === 'Ops' ? 'ops_toggle' : 'config_change');

exports.list = async (req, res) => {
  try {
    const flags = await Flag.find().sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, key, type, description, envs, rules, variants, rollout, on } = req.body;
    if (!name || !key) {
      return res.status(400).json({ message: 'name and key are required' });
    }
    if (await Flag.findOne({ key })) {
      return res.status(400).json({ message: 'A flag with this key already exists' });
    }

    const actor = req.user.email;
    const flag = await Flag.create({
      name,
      key,
      type: type || 'Release',
      description: description || '',
      envs,
      rules,
      variants,
      rollout: rollout || 0,
      on: on || false,
      by: actor,
      createdBy: actor,
      when: 'just now',
    });

    await writeAudit({
      action: auditAction(flag.type),
      actor,
      flag: flag.name,
      key: flag.key,
      summary: `Created flag ${flag.name}`,
      diff: [{ field: 'state', before: 'none', after: flag.on ? 'on' : 'off' }],
    });

    res.status(201).json(flag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const flag = await Flag.findOne({ key: req.params.key });
    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    const before = { on: flag.on, rollout: flag.rollout };
    flag.on = !flag.on;
    flag.rollout = flag.on ? (flag.rollout > 0 ? flag.rollout : 100) : 0;
    flag.by = req.user.email;
    flag.when = 'just now';
    await flag.save();

    await writeAudit({
      action: auditAction(flag.type),
      actor: req.user.email,
      flag: flag.name,
      key: flag.key,
      summary: `Flag ${flag.name} switched ${flag.on ? 'on' : 'off'}`,
      diff: [
        { field: 'state', before: before.on ? 'on' : 'off', after: flag.on ? 'on' : 'off' },
        { field: 'rolloutPercent', before: String(before.rollout), after: String(flag.rollout) },
      ],
    });

    res.json(flag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRollout = async (req, res) => {
  try {
    const { rollout } = req.body;
    if (typeof rollout !== 'number' || rollout < 0 || rollout > 100) {
      return res.status(400).json({ message: 'rollout must be a number between 0 and 100' });
    }

    const flag = await Flag.findOne({ key: req.params.key });
    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    const before = flag.rollout;
    flag.rollout = rollout;
    flag.by = req.user.email;
    flag.when = 'just now';
    await flag.save();

    await writeAudit({
      action: auditAction(flag.type),
      actor: req.user.email,
      flag: flag.name,
      key: flag.key,
      summary: `Rollout changed on ${flag.name}`,
      diff: [{ field: 'rolloutPercent', before: String(before), after: String(rollout) }],
    });

    res.json(flag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rollback = async (req, res) => {
  try {
    const flag = await Flag.findOne({ key: req.params.key });
    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    const before = { on: flag.on, rollout: flag.rollout };
    flag.on = false;
    flag.rollout = 0;
    flag.by = req.user.email;
    flag.when = 'just now';
    await flag.save();

    await writeAudit({
      action: 'auto_rollback',
      actor: req.user.email,
      flag: flag.name,
      key: flag.key,
      summary: `Flag ${flag.name} rolled back to 0%`,
      diff: [
        { field: 'state', before: before.on ? 'on' : 'off', after: 'off' },
        { field: 'rolloutPercent', before: String(before.rollout), after: '0' },
      ],
    });

    res.json(flag);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
