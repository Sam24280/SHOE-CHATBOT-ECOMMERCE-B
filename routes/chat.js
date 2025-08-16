// routes/chat.js
const express = require('express');
const { handleChatMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');



const router = express.Router();

// All chat routes require authentication
router.use(protect);

router.post('/message', handleChatMessage);
router.get('/history', getChatHistory);

module.exports = router;