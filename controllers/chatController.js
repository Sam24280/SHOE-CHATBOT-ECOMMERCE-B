const { processUserMessage } = require('../utils/nlpProcessor');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ChatHistory = require('../models/ChatHistory');

const handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Get all products for context
    const products = await Product.find({});
    
    // Get user's current cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const cartItems = cart ? cart.items : [];

    // Process message with NLP
    const nlpResult = await processUserMessage(message, products, cartItems);

    let responseData = {
      intent: nlpResult.intent,
      response: nlpResult.response,
      products: []
    };

    // Handle different intents
    switch (nlpResult.intent) {
      case 'browse':
        const browseProducts = await Product.find({
          category: nlpResult.category
        }).limit(3);
        responseData.products = browseProducts;
        break;

      case 'add_to_cart':
        if (nlpResult.productName && nlpResult.size && nlpResult.color) {
          const product = await Product.findOne({
            name: { $regex: nlpResult.productName, $options: 'i' }
          });

          if (product) {
            // Add to cart logic (reuse from cartController)
            let userCart = await Cart.findOne({ user: userId });
            if (!userCart) {
              userCart = await Cart.create({ user: userId, items: [] });
            }

            const existingItemIndex = userCart.items.findIndex(item => 
              item.product.toString() === product._id.toString() && 
              item.size === nlpResult.size && 
              item.color.toLowerCase() === nlpResult.color.toLowerCase()
            );

            if (existingItemIndex > -1) {
              userCart.items[existingItemIndex].quantity += 1;
            } else {
              userCart.items.push({ 
                product: product._id, 
                size: nlpResult.size, 
                color: nlpResult.color, 
                quantity: 1 
              });
            }

            await userCart.save();
            responseData.response = `Great! I've added the ${product.name} in ${nlpResult.color} (size ${nlpResult.size}) to your cart.`;
          }
        }
        break;

      case 'remove_from_cart':
        if (nlpResult.productName) {
          const product = await Product.findOne({
            name: { $regex: nlpResult.productName, $options: 'i' }
          });

          if (product && cart) {
            cart.items = cart.items.filter(item => 
              !(item.product.toString() === product._id.toString() && 
                (!nlpResult.size || item.size === nlpResult.size) &&
                (!nlpResult.color || item.color.toLowerCase() === nlpResult.color.toLowerCase()))
            );

            await cart.save();
            responseData.response = `I've removed the ${product.name} from your cart.`;
          }
        }
        break;

      case 'checkout':
        if (cart && cart.items.length > 0) {
          const total = cart.items.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
          }, 0);
          responseData.response = `Your cart total is $${total}. Would you like to proceed with checkout? Please provide your shipping address.`;
        } else {
          responseData.response = "Your cart is empty. Would you like to browse our shoe collection?";
        }
        break;
    }

    // Save chat history
    await ChatHistory.create({
      user: userId,
      message,
      response: responseData.response,
      intent: nlpResult.intent
    });

    res.json(responseData);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      response: 'I apologize, but I encountered an error. Please try again.',
      intent: 'error'
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleChatMessage, getChatHistory };