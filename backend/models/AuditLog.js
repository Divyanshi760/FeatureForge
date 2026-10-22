const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    action: {
      type: String,
      enum: ['config_change', 'approval', 'ops_toggle', 'break_glass', 'auto_rollback'],
      required: true,
    },
    actor: {
      type: String,
      required: true,
    },
    system: {
      type: Boolean,
      default: false,
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
    day: {
      type: String,
      default: 'Today',
    },
    at: {
      type: String,
      default: '',
    },
    when: {
      type: String,
      default: 'just now',
    },
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
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
