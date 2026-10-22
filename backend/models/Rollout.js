const mongoose = require('mongoose');

const rolloutSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    flag: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    env: {
      type: String,
      default: 'prod',
    },
    rollout: {
      type: Number,
      default: 0,
    },
    startedLabel: {
      type: String,
      default: '',
    },
    trend: {
      type: String,
      enum: ['healthy', 'degrading', 'rolled_back'],
      default: 'healthy',
    },
    metric: {
      key: String,
      label: String,
      unit: String,
      threshold: Number,
      control: Number,
      variant: Number,
      noise: Number,
      windowLabel: String,
      windowsToRollback: Number,
      minSample: Number,
    },
    rollbacks: [
      {
        at: String,
        reason: String,
        detail: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Rollout', rolloutSchema);
