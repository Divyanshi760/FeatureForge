const Rollout = require('../models/Rollout');

exports.list = async (req, res) => {
  try {
    const rollouts = await Rollout.find();
    res.json(rollouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
