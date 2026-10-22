const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      default: '123456',
    },
    role: {
      type: String,
      enum: ['admin', 'developer', 'user', 'Admin', 'Maintainer', 'Viewer'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: function () {
        if (!this.name) return 'U';
        const parts = this.name.split(' ');
        return parts.length > 1
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : this.name.slice(0, 2).toUpperCase();
      },
    },
    // Developer status and metrics
    status: {
      type: String,
      enum: ['free', 'occupied', 'active', 'pending', 'inactive'],
      default: 'active',
    },
    specialty: {
      type: String,
      default: null,
    },
    activeIssues: {
      type: Number,
      default: 0,
    },
    resolvedTotal: {
      type: Number,
      default: 0,
    },
    currentIssue: {
      type: String,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    // Team & RBAC fields
    owner: {
      type: Boolean,
      default: false,
    },
    scope: {
      type: String,
      default: 'Project-wide',
    },
    service: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: String,
      default: 'online now',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
