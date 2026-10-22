const Experiment = require('../models/Experiment');

exports.list = async (req, res) => {
  try {
    const experiments = await Experiment.find();
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
