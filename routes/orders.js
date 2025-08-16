const express = require('express');
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth'); // ✅ matches the export

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);

module.exports = router;
