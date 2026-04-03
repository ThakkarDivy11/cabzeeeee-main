require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function getOTP() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    console.log('Connected to MongoDB');

    // Get all users with OTP
    const users = await User.find({
      otp: { $exists: true },
      otpExpiresAt: { $gt: new Date() }
    }, 'name email otp otpExpiresAt');

    console.log(`\n🔑 ACTIVE OTPs FOUND: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ No active OTPs found. Try registering first.');
      console.log('💡 Run: node scripts/testDhruvRegistration.js');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   🔢 OTP: ${user.otp.code || user.otp}`);
        console.log(`   ⏰ Expires: ${user.otpExpiresAt || user.otpExpiresAt}`);
        console.log(`   📧 Use this OTP to verify: ${user.otp.code || user.otp}`);
        console.log('   ---');
      });
    }

    // Also show recent registrations
    console.log('\n📋 RECENT UNVERIFIED USERS:');
    const recentUsers = await User.find({
      isVerified: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    }, 'name email phone createdAt');

    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} (${user.phone})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

getOTP();
