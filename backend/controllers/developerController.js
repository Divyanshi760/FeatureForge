const mongoose = require('mongoose');
const User = require('../models/User');

const DEV_STATUSES = ['free', 'occupied', 'active', 'pending', 'inactive'];

exports.list = async (req, res) => {
  try {
    const developers = await User.find({ role: 'developer' }).select('-password');
    res.json(developers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!DEV_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    const developer = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    if (!developer) return res.status(404).json({ message: 'Developer not found' });
    res.json(developer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// A developer sets their own availability.
exports.updateMyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!DEV_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const developer = await User.findByIdAndUpdate(
      req.user.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    if (!developer) return res.status(404).json({ message: 'Developer not found' });
    res.json(developer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
