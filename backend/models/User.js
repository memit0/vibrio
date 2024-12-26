const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'influencer', 'business_owner'],
    required: true
  }
}, { timestamps: true });

// Drop all indexes and recreate them
userSchema.pre('save', async function(next) {
  try {
    await mongoose.connection.collection('users').dropIndexes();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);