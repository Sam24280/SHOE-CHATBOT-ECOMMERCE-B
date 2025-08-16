const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    cart.total = total;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate size and color
    if (!product.sizes.includes(size)) {
      return res.status(400).json({ message: 'Size not available' });
    }
    
    if (!product.colors.includes(color.toLowerCase())) {
      return res.status(400).json({ message: 'Color not available' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size && 
      item.color.toLowerCase() === color.toLowerCase()
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, color, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    cart.total = total;
    await cart.save();

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      !(item.product.toString() === productId && 
        item.size === size && 
        item.color.toLowerCase() === color.toLowerCase())
    );

    await cart.save();
    await cart.populate('items.product');

    // Recalculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    cart.total = total;
    await cart.save();

    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (cart) {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
