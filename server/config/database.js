const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.warn('Warning: MONGODB_URI not set. Using default local MongoDB.');
    }

    const conn = await mongoose.connect(mongoURI || 'mongodb://localhost:27017/vikasite', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Please check your MONGODB_URI environment variable');
    // Don't exit in production - let the app start and show error
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;


