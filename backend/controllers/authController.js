const { User, WorkerProfile } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, password, role, phone, location } = req.body;
    const email = req.body.email?.toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const allowedRoles = ['client', 'worker'];
    const assignedRole = allowedRoles.includes(role) ? role : 'client';
    const status = assignedRole === 'worker' ? 'pending' : 'active';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      status,
      phone,
      location
    });

    if (user) {
      if (user.role === 'worker') {
        await WorkerProfile.create({
          userId: user.id,
          experience: 'Not specified',
          hourlyRate: 15.0,
          description: 'New worker account',
        });
      }

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profileImage: user.profileImage,
        status: user.status,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('[authController.registerUser Error]:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error.message;
    res.status(500).json({ message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    const { password } = req.body;

    // Check for user email
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      logger.info(`User login successful: ${email}`);
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profileImage: user.profileImage,
        status: user.status,
        token: generateToken(user.id)
      });
    } else {
      logger.warn(`Failed login attempt for email: ${email} from IP: ${req.ip}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[authController.loginUser Error]:', error);
    const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error.message;
    res.status(500).json({ message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profileImage: user.profileImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('[authController.getUserProfile Error]:', error);
    const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error.message;
    res.status(500).json({ message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email?.toLowerCase() || user.email;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;
      user.profileImage = req.body.profileImage || user.profileImage;
      
      // Explicitly preventing role and status modification
      // user.role = req.body.role || user.role;
      // user.status = req.body.status || user.status;

      if (req.body.password) {
        if (!req.body.oldPassword) {
          return res.status(400).json({ message: 'Must provide current password as oldPassword to update it.' });
        }
        
        const isMatch = await user.matchPassword(req.body.oldPassword);
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        profileImage: updatedUser.profileImage,
        status: updatedUser.status,
        token: generateToken(updatedUser.id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('[authController.updateUserProfile Error]:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error.message;
    res.status(500).json({ message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
