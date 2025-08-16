const mongoose = require('mongoose');
require('dotenv').config();

// Sample product data
const products = [
  {
    name: "Air Max Running Shoes",
    brand: "Nike",
    category: "running",
    price: 120,
    description: "Comfortable running shoes with excellent cushioning and breathable mesh upper. Perfect for daily runs and long-distance training.",
    image: "/images/shoes/air-max-running.jpg",
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["black", "white", "red", "blue", "gray"],
    inStock: true,
    features: ["Air Max cushioning", "Breathable mesh", "Durable rubber outsole"]
  },
  {
    name: "Classic White Sneakers",
    brand: "Adidas",
    category: "sneakers",
    price: 85,
    description: "Timeless white sneakers with clean lines and premium materials. A versatile choice for casual wear and street style.",
    image: "/images/shoes/classic-white-sneakers.jpg",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    colors: ["white", "cream", "off-white"],
    inStock: true,
    features: ["Premium leather upper", "Rubber cup sole", "Comfortable footbed"]
  },
  {
    name: "Formal Black Oxfords",
    brand: "Cole Haan",
    category: "formal",
    price: 200,
    description: "Elegant black oxford shoes crafted from premium leather. Perfect for business meetings, formal events, and professional settings.",
    image: "/images/shoes/formal-black-oxfords.jpg",
    sizes: [7, 8, 9, 10, 11, 12, 13],
    colors: ["black", "brown", "dark brown"],
    inStock: true,
    features: ["Genuine leather", "Goodyear welt", "Cushioned insole"]
  },
  {
    name: "Sport Training Shoes",
    brand: "Under Armour",
    category: "sports",
    price: 95,
    description: "Versatile training shoes designed for cross-training, gym workouts, and various sports activities. Enhanced stability and support.",
    image: "/images/shoes/sport-training.jpg",
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["black", "gray", "red", "navy", "white"],
    inStock: true,
    features: ["Cross-training design", "Enhanced stability", "Breathable upper"]
  },
  {
    name: "Casual Canvas Shoes",
    brand: "Converse",
    category: "casual",
    price: 60,
    description: "Classic canvas shoes with vintage appeal. Comfortable for everyday wear and perfect for a relaxed, casual style.",
    image: "/images/shoes/casual-canvas.jpg",
    sizes: [5, 6, 7, 8, 9, 10, 11, 12],
    colors: ["black", "white", "red", "navy", "green"],
    inStock: true,
    features: ["Canvas upper", "Rubber outsole", "Classic design"]
  },
  {
    name: "Ultraboost Running Shoes",
    brand: "Adidas",
    category: "running",
    price: 180,
    description: "High-performance running shoes with responsive Boost cushioning. Engineered for comfort and energy return on every stride.",
    image: "/images/shoes/ultraboost-running.jpg",
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["black", "white", "gray", "blue"],
    inStock: true,
    features: ["Boost cushioning", "Primeknit upper", "Continental rubber outsole"]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🍃 Connected to MongoDB');

    // Import models here when they're created
    const Product = require('../models/Product');
    
    // Clear existing data
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert new data
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    
    console.log('🎉 Database seeded successfully');
    console.log('Products available:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.price}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Export products for use in other files
module.exports = { products, seedDatabase };

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}