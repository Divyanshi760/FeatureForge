const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Release', 'Experiment', 'Ops', 'Permission'],
      default: 'Release',
    },
    on: {
      type: Boolean,
      default: false,
    },
    rollout: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    by: {
      type: String,
      default: 'admin@',
    },
    when: {
      type: String,
      default: 'just now',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'admin@',
    },
    envs: {
      dev: { type: Boolean, default: true },
      staging: { type: Boolean, default: true },
      prod: { type: Boolean, default: false },
    },
    rules: [
      {
        attr: String,
        op: String,
        value: String,
      },
    ],
    variants: [
      {
        name: String,
        weight: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Flag', flagSchema);
