const User = require('../models/User');

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
    const developer = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    res.json(developer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// A developer sets their own availability.
exports.updateMyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const developer = await User.findByIdAndUpdate(
      req.user.id,
      { status },
      { new: true }
    ).select('-password');
    res.json(developer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
