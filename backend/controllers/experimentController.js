const Experiment = require('../models/Experiment');
const { nextSeq } = require('../lib/audit');

exports.list = async (req, res) => {
  try {
    const experiments = await Experiment.find();
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, flag, key, metric, metricLabel, minSampleSize, horizon, variants } = req.body;
    if (!name || !flag || !key || !metric) {
      return res.status(400).json({ message: 'name, flag, key and metric are required' });
    }

    const seq = await nextSeq(Experiment, 'EXP');
    const sample = minSampleSize || 5000;
    const experiment = await Experiment.create({
      id: `EXP-${seq}`,
      name,
      flag,
      key,
      metric,
      metricLabel: metricLabel || metric,
      draft: true,
      startedLabel: 'Not started',
      minSampleSize: sample,
      horizon: horizon || { type: 'sample', target: sample, dateLabel: 'TBD' },
      variants:
        variants && variants.length
          ? variants
          : [
              { name: 'control', exposures: 0, conversions: 0 },
              { name: 'variant-b', exposures: 0, conversions: 0 },
            ],
    });

    res.status(201).json(experiment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
