const mongoose = require('mongoose');

function computePriority(count) {
  if (count >= 10) return 'critical';
  if (count >= 5) return 'high';
  if (count >= 2) return 'medium';
  return 'low';
}

const issueSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reportCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: function () {
        return computePriority(this.reportCount || 1);
      },
    },
    reporters: [
      {
        id: String,
        name: String,
        email: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    reportedBy: {
      id: String,
      name: String,
      email: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    assignmentType: {
      type: String,
      enum: ['admin_assigned', 'self_picked', null],
      default: null,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
    selfPickRequest: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Always auto-compute priority based on reportCount before save
issueSchema.pre('save', function () {
  this.priority = computePriority(this.reportCount || 1);
});

module.exports = mongoose.model('Issue', issueSchema);
module.exports.computePriority = computePriority;
