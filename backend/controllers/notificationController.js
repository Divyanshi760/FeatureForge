const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// List notifications for the authenticated user
exports.list = async (req, res) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    const notifications = await Notification.find({
      'recipient.email': userEmail,
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = await Notification.countDocuments({
      'recipient.email': userEmail,
      read: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a single notification as read
exports.markRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient?.email?.toLowerCase() !== req.user.email?.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all notifications for the user as read
exports.markAllRead = async (req, res) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    await Notification.updateMany(
      { 'recipient.email': userEmail, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear a notification
exports.deleteNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient?.email?.toLowerCase() !== req.user.email?.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
