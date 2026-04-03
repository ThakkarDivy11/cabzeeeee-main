const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

const API_BASE = 'http://localhost:5000/api/auth';

async function registerAndShowOTP() {
  try {
    console.log('🚀 Registering user and showing OTP...\n');

    // Generate unique credentials
    const timestamp = Date.now();
    const testEmail = `user${timestamp}@example.com`;
    const testPhone = timestamp.toString().slice(-10);

    console.log('📧 REGISTERING:');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: password123`);
    console.log(`Phone: ${testPhone}`);
    console.log(`Role: rider\n`);

    // Register the user
    const response = await axios.post(`${API_BASE}/register`, {
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      phone: testPhone,
      role: 'rider'
    });

    console.log('✅ Registration successful!\n');

    // Small delay to ensure OTP is saved
    console.log('⏳ Checking for OTP in database...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Connect to database to get OTP
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    const user = await User.findOne({ email: testEmail });

    if (user && user.otp && user.otp.code) {
      console.log('\n🎯 === OTP FOUND ===');
      console.log(`🔢 OTP: ${user.otp.code}`);
      console.log(`⏰ Expires: ${user.otp.expiresAt}`);
      console.log(`📧 Email: ${testEmail}\n`);

      console.log('📋 COPY THESE DETAILS:');
      console.log(`Email: ${testEmail}`);
      console.log(`OTP: ${user.otp.code}\n`);

      console.log('🔐 VERIFICATION:');
      console.log(`Use this OTP in your app to verify the email: ${user.otp.code}`);

      console.log('\n🚀 LOGIN READY:');
      console.log(`Email: ${testEmail}`);
      console.log(`Password: password123`);
      console.log(`Role: rider`);
    } else {
      console.log('\n❌ OTP not found in database');
      console.log('💡 Try checking the backend server console directly');
      console.log('💡 Or wait a moment and run: node scripts/getOTP.js');
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('\n❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }

    console.log('\n💡 If email failed, the OTP should be in the backend console!');
  }
}

registerAndShowOTP();
