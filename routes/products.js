const express = require('express');
const router = express.Router();
const { getProducts, getProductById, searchProducts, addProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware'); // optional if you want to protect adding

// Get all products
router.get('/', getProducts);

router.get('/:id', getProductById);

router.post('/search', searchProducts);

router.post('/add', authMiddleware, addProduct);

module.exports = router;
