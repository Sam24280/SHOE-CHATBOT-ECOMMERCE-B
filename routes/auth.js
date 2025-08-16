const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
