const Breakglass = require('../models/Breakglass');

exports.list = async (req, res) => {
  try {
    const sessions = await Breakglass.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
