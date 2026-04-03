require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testDhruvRegistration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    console.log('Connected to MongoDB');

    // Delete existing dhruv user if exists
    const deletedUser = await User.findOneAndDelete({ email: 'dhruvudhwani123@gmail.com' });
    if (deletedUser) {
      console.log('🗑️  Deleted existing user: dhruvudhwani123@gmail.com');
    }

    // Close MongoDB connection
    await mongoose.connection.close();

    console.log('🔄 Registering dhruvudhwani123@gmail.com...');

    // Now register the user
    const response = await axios.post(`${API_BASE}/register`, {
      name: 'Dhruv',
      email: 'dhruvudhwani123@gmail.com',
      password: 'password123',
      phone: '1234567897',
      role: 'rider'
    });

    console.log('✅ Registration successful!');
    console.log('📧 Check backend console for OTP: dhruvudhwani123@gmail.com');

    // Reconnect to get the OTP
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    const user = await User.findOne({ email: 'dhruvudhwani123@gmail.com' });

    if (user && user.otp) {
      console.log(`🔑 OTP for dhruvudhwani123@gmail.com: ${user.otp}`);
      console.log(`📱 Use this OTP to verify your account: ${user.otp}`);
    } else {
      console.log('⚠️  OTP not found in database. Check backend server console.');
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDhruvRegistration();
