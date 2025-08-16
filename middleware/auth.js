const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware (requires authentication)
async function protect(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    res.status(500).json({ error: 'Token verification failed.' });
  }
}

// Optional auth middleware (doesn't fail if no token)
async function optionalAuth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    next(); // Continue without blocking
  }
}

module.exports = { protect, optionalAuth };

