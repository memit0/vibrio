const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    // Drop the problematic index
    try {
      await mongoose.connection.collection('users').dropIndex('username_1');
      console.log('Successfully dropped username index');
    } catch (error) {
      console.log('No username index to drop or already dropped');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});