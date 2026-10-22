const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admins are provisioned via the seed, never through public registration.
const SELF_REGISTER_ROLES = ['user', 'developer'];

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        specialty: user.specialty,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, specialty } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const safeRole = SELF_REGISTER_ROLES.includes(role) ? role : 'user';
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: safeRole,
      status: safeRole === 'developer' ? 'free' : 'active',
      specialty: specialty || null,
    });

    res.status(201).json({
      message: 'Registration successful',
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
