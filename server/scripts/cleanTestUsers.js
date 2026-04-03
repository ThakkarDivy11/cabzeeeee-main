require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function cleanTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    console.log('Connected to MongoDB');

    // Remove test users (those with 'test' in email or name)
    const testUsers = await User.find({
      $or: [
        { email: { $regex: 'test.*@example.com' } },
        { name: { $regex: 'Test User' } }
      ]
    });

    console.log(`Found ${testUsers.length} test users to remove`);

    for (const user of testUsers) {
      await User.findByIdAndDelete(user._id);
      console.log(`Removed test user: ${user.email}`);
    }

    // Show remaining users
    const remainingUsers = await User.find({}, '-password');
    console.log(`\n=== Remaining users: ${remainingUsers.length} ===\n`);

    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

cleanTestUsers();
