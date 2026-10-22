const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
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
    type: {
      type: String,
      default: 'Release',
    },
    env: {
      type: String,
      default: 'prod',
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedAt: {
      type: String,
      default: 'just now',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    needed: {
      type: Number,
      default: 2,
    },
    approvals: [
      {
        type: String,
      },
    ],
    summary: {
      type: String,
      default: '',
    },
    diff: [
      {
        field: String,
        before: String,
        after: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Approval', approvalSchema);
