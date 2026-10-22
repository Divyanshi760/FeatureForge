const mongoose = require('mongoose');

const breakglassSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
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
    env: {
      type: String,
      default: 'prod',
    },
    reason: {
      type: String,
      required: true,
    },
    grantedLabel: {
      type: String,
      default: 'just now',
    },
    durationMin: {
      type: Number,
      required: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    },
    used: {
      type: String,
      default: 'No changes yet',
    },
    endedLabel: {
      type: String,
      default: null,
    },
    closedBy: {
      type: String,
      default: null,
    },
    changes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Breakglass', breakglassSchema);
