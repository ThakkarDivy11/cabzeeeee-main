require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function clearDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
    console.log('Connected to MongoDB');

    // Keep only the admin user
    const adminEmail = 'divythakkar318@gmail.com';

    // Delete all users except admin
    const deleteResult = await User.deleteMany({
      email: { $ne: adminEmail }
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);
    console.log(`✅ Kept admin user: ${adminEmail}`);

    // Verify remaining users
    const remainingUsers = await User.find({}, '-password');
    console.log(`\n=== Remaining users: ${remainingUsers.length} ===\n`);

    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

clearDatabase();
