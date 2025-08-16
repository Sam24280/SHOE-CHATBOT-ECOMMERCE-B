const Order = require('../models/Order');
const Cart = require('../models/Cart');

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'card' } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      })),
      total,
      shippingAddress,
      paymentMethod
    });

    // Clear cart after successful order
    cart.items = [];
    cart.total = 0;
    await cart.save();

    await order.populate('items.product');

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order,
      orderNumber: order._id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById };
