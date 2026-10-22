const Flag = require('../models/Flag');

exports.list = async (req, res) => {
  try {
    const flags = await Flag.find().sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggle = async (req, res) => {
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
};
