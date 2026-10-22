const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    metric: {
      type: String,
      required: true,
    },
    metricLabel: {
      type: String,
      default: '',
    },
    startedLabel: {
      type: String,
      default: 'Not started',
    },
    draft: {
      type: Boolean,
      default: false,
    },
    minSampleSize: {
      type: Number,
      default: 5000,
    },
    horizon: {
      type: {
        type: String,
        default: 'sample',
      },
      target: {
        type: Number,
        default: 5000,
      },
      dateLabel: {
        type: String,
        default: 'TBD',
      },
    },
    variants: [
      {
        name: { type: String, required: true },
        exposures: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Experiment', experimentSchema);
