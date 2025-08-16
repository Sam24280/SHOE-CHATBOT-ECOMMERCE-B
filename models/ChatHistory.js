const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  response: {
    type: String,
    required: true,
    maxlength: 2000
  },
  intent: {
    type: String,
    enum: ['browse', 'add_to_cart', 'remove_from_cart', 'checkout', 'general'],
    default: 'general'
  },
  metadata: {
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    category: String,
    processingTime: Number
  },
  sessionId: {
    type: String,
    default: function() {
      return Date.now().toString();
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatHistorySchema.index({ user: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);