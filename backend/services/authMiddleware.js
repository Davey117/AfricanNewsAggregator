// services/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * ENDPOINT GUARD ROUTINE
 * Intercepts Bearer tokens inside HTTP headers to protect administrative paths.
 */
async function protectAdminRoute(req, res, next) {
  let token;

  // 1. Check for the existence of the Authorization Bearer token header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. Professional administrative token authorization header is missing.'
    });
  }

  try {
    // 2. Natively verify cryptographic token signature validity
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Ensure the administrative identity target profile still exists in database records
    const currentAdmin = await User.findById(decodedPayload.id).select('-password').lean();
    if (!currentAdmin) {
      return res.status(401).json({ status: 'fail', message: 'The administrator account matching this token no longer exists.' });
    }

    // 4. Bind the resolved identity structure directly onto the running request thread context
    req.adminUser = currentAdmin;
    next(); // Pass control cleanly to the next execution controller
  } catch (error) {
    console.error(`[AUTH SECURITY BREACH] Token clearance rejected: ${error.message}`);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired authentication token structure.'
    });
  }
}

module.exports = { protectAdminRoute };