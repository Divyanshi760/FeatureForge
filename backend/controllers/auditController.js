const AuditLog = require('../models/AuditLog');

exports.list = async (req, res) => {
  try {
    const entries = await AuditLog.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
