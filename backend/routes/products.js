const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      userId: req.userId
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 