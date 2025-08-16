// ==========================================
// utils/nlpProcessor.js - OpenAI NLP Processing
// ==========================================
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define available intents and their patterns
const INTENTS = {
  BROWSE: 'browse',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_CART: 'view_cart',
  CHECKOUT: 'checkout',
  GENERAL: 'general'
};

const CATEGORIES = {
  RUNNING: 'running',
  CASUAL: 'casual',
  FORMAL: 'formal',
  SPORTS: 'sports',
  SNEAKERS: 'sneakers'
};

const processUserMessage = async (message, products = [], cartItems = []) => {
  const systemPrompt = `You are an AI assistant for a shoe e-commerce store called "SoleChat". 
  Your job is to understand customer requests and respond helpfully.

  IMPORTANT: Always return valid JSON with this exact structure:
  {
    "intent": "browse|add_to_cart|remove_from_cart|view_cart|checkout|general",
    "category": "running|casual|formal|sports|sneakers|null",
    "productName": "exact product name or null",
    "size": "number or null",
    "color": "color name or null",
    "quantity": "number or 1",
    "response": "friendly response to user",
    "confidence": "high|medium|low"
  }

  AVAILABLE PRODUCTS: ${JSON.stringify(products.map(p => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
    colors: p.colors || [],
    sizes: p.sizes || [],
    price: p.price
  })), null, 2)}

  CURRENT CART ITEMS: ${JSON.stringify(cartItems.map(item => ({
    productName: item.product?.name || 'Unknown',
    size: item.size,
    color: item.color,
    quantity: item.quantity
  })), null, 2)}

  USER MESSAGE: "${message}"

  RESPONSE GUIDELINES:
  - Be friendly and helpful
  - For browsing: suggest 2-3 relevant products
  - For adding items: confirm the specific product, size, and color
  - For removing items: confirm what's being removed
  - For checkout: guide them through the process
  - If unclear: ask for clarification
  - Always match products by exact name from the available list`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    console.log('OpenAI raw response:', responseContent);
    
    const parsed = JSON.parse(responseContent);
    
    // Validate response structure
    const validatedResponse = {
      intent: parsed.intent || INTENTS.GENERAL,
      category: parsed.category || null,
      productName: parsed.productName || null,
      size: parsed.size ? Number(parsed.size) : null,
      color: parsed.color || null,
      quantity: parsed.quantity ? Number(parsed.quantity) : 1,
      response: parsed.response || "I'm here to help you find the perfect shoes!",
      confidence: parsed.confidence || 'medium'
    };

    return validatedResponse;

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response
    return {
      intent: INTENTS.GENERAL,
      category: null,
      productName: null,
      size: null,
      color: null,
      quantity: 1,
      response: "I apologize, but I'm having trouble understanding your request right now. Could you please rephrase that? You can ask me to show you shoes, add items to your cart, or help with checkout!",
      confidence: 'low'
    };
  }
};

// Simple intent detection without AI (fallback)
const detectIntentFallback = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('show') || lowerMessage.includes('browse') || 
      lowerMessage.includes('looking for') || lowerMessage.includes('find')) {
    return INTENTS.BROWSE;
  }
  
  if (lowerMessage.includes('add') && (lowerMessage.includes('cart') || 
      lowerMessage.includes('buy'))) {
    return INTENTS.ADD_TO_CART;
  }
  
  if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
    return INTENTS.REMOVE_FROM_CART;
  }
  
  if (lowerMessage.includes('cart') || lowerMessage.includes('basket')) {
    return INTENTS.VIEW_CART;
  }
  
  if (lowerMessage.includes('checkout') || lowerMessage.includes('order') || 
      lowerMessage.includes('buy now')) {
    return INTENTS.CHECKOUT;
  }
  
  return INTENTS.GENERAL;
};

module.exports = { 
  processUserMessage, 
  detectIntentFallback, 
  INTENTS, 
  CATEGORIES 
};