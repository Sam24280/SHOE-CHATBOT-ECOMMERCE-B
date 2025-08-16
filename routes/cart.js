//routes/cart.js
const express = require('express');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;