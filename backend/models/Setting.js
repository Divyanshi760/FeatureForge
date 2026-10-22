const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
    },
    project: {
      org: { type: String, default: 'Northwind' },
      name: { type: String, default: 'Checkout Platform' },
    },
    environments: [
      {
        id: String,
        name: String,
        slug: String,
        sdkKey: String,
        serverKey: String,
        lastUsed: String,
      },
    ],
    webhook: {
      url: { type: String, default: '' },
      events: {
        auto_rollback: { type: Boolean, default: true },
        break_glass: { type: Boolean, default: true },
        approval: { type: Boolean, default: true },
        config_change: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
