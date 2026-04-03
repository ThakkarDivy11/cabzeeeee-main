require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}, '-password'); // Exclude password field
    console.log(`\n=== Total users in database: ${users.length} ===\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user._id}`);
      console.log('   ---');
    });

    // Check for specific email/phone patterns
    console.log('\n=== Checking for duplicate emails/phones ===');

    const emailCount = {};
    const phoneCount = {};

    users.forEach(user => {
      emailCount[user.email] = (emailCount[user.email] || 0) + 1;
      phoneCount[user.phone] = (phoneCount[user.phone] || 0) + 1;
    });

    console.log('Duplicate emails:');
    Object.entries(emailCount).forEach(([email, count]) => {
      if (count > 1) console.log(`  ${email}: ${count} times`);
    });

    console.log('Duplicate phones:');
    Object.entries(phoneCount).forEach(([phone, count]) => {
      if (count > 1) console.log(`  ${phone}: ${count} times`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkUsers();
