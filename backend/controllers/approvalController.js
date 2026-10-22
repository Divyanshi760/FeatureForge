const Approval = require('../models/Approval');

exports.list = async (req, res) => {
  try {
    const approvals = await Approval.find().sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
