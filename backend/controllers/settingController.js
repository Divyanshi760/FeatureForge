const Setting = require('../models/Setting');

exports.get = async (req, res) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
