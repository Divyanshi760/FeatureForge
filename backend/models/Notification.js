const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      id: String,
      name: String,
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    type: {
      type: String,
      enum: ['issue_assignment_update', 'issue_assigned', 'self_pick_rejected', 'general'],
      default: 'issue_assignment_update',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    issueId: {
      type: String,
      default: null,
    },
    issueTitle: {
      type: String,
      default: null,
    },
    assignedTo: {
      id: String,
      name: String,
      email: String,
      estimatedDays: Number,
    },
    actionUrl: {
      type: String,
      default: '/developer/available',
    },
    actionText: {
      type: String,
      default: 'Pick Other Issues',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
