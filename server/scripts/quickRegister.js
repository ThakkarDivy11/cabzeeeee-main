const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

const API_BASE = 'http://localhost:5000/api/auth';

async function quickRegister() {
  try {
    console.log('🚀 Quick Registration with OTP Display...\n');

    // Generate unique credentials
    const timestamp = Date.now();
    const testEmail = `user${timestamp}@example.com`;
    const testPhone = timestamp.toString().slice(-10);

    console.log('📝 Registration Details:');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: password123`);
    console.log(`📱 Phone: ${testPhone}`);
    console.log(`👤 Role: rider\n`);

    // Register the user
    const response = await axios.post(`${API_BASE}/register`, {
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      phone: testPhone,
      role: 'rider'
    });

    console.log('✅ Registration successful!');
    console.log('⏳ Waiting for OTP to be saved...');

    // Wait a moment for OTP to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Connect to database to get OTP
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    const user = await User.findOne({ email: testEmail });

    if (user && user.otp && user.otp.code) {
      console.log('\n🎯 OTP DETAILS:');
      console.log(`🔢 OTP Code: ${user.otp.code}`);
      console.log(`⏰ Expires: ${user.otp.expiresAt}`);
      console.log(`📧 Email: ${testEmail}`);

      console.log('\n🔐 VERIFICATION COMMAND:');
      console.log(`node -e "const axios = require('axios'); axios.post('http://localhost:5000/api/auth/verify-otp', {email:'${testEmail}', otp:'${user.otp.code}'}).then(r=>console.log('✅ Verified!')).catch(e=>console.log('❌ Failed:', e.response?.data))"`);

      console.log('\n🚀 LOGIN CREDENTIALS:');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Password: password123`);
      console.log(`👤 Role: rider`);

      console.log('\n📋 QUICK COPY:');
      console.log(`Email: ${testEmail}`);
      console.log(`OTP: ${user.otp.code}`);
    } else {
      console.log('⚠️  OTP not found. Check backend console logs.');
      console.log('💡 The OTP might be shown in the backend server console.');
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

quickRegister();
