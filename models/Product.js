// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 100
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['running', 'casual', 'formal', 'sports', 'sneakers'],
      message: 'Category must be one of: running, casual, formal, sports, sneakers'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 500
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
    default: '/images/shoes/default.jpg'
  },
  sizes: [{
    type: Number,
    required: true,
    min: 5,
    max: 15
  }],
  colors: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 100,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add text index for search
productSchema.index({
  name: 'text',
  brand: 'text',
  description: 'text',
  category: 'text'
});

module.exports = mongoose.model('Product', productSchema);