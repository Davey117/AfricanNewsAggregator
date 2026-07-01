// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register an administrative account (Typically locked down after first setup)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation checks
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide name, email, and password.' });
    }

    // 2. Prevent duplicate administrative accounts
    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'An account with this email address already exists.' });
    }

    // 3. Cryptographic Password Hashing (12 salt rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Persist user document to MongoDB Atlas
    const newAdmin = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });
    await newAdmin.save();

    res.status(201).json({
      status: 'success',
      message: 'Administrative user registered successfully.'
    });
  } catch (error) {
    console.error(`[AUTH ERROR] Registration failure: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Internal server registration processing failure.' });
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate administrative credentials and return a secure signed JWT Bearer Token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide both email and password.' });
    }

    // 1. Locate user record and explicitly include password field for comparison
    const adminUser = await User.findOne({ email: email.toLowerCase() });
    if (!adminUser) {
      return res.status(401).json({ status: 'fail', message: 'Invalid authentication credentials.' });
    }

    // 2. Validate password hashes concurrently using bcrypt
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Invalid authentication credentials.' });
    }

    // 3. Sign Token using our .env secret definitions
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'success',
      token,
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error(`[AUTH ERROR] Login failure: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Internal server processing failure.' });
  }
});

module.exports = router;