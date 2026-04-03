require('dotenv').config();
const mongoose = require('mongoose');

async function checkMongoConnection() {
  try {
    console.log('🔍 Checking MongoDB Connection...\n');

    // Get connection string
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uber';
    console.log('📡 Connection String:', mongoURI);
    console.log('📊 Database Name: uber\n');

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Successfully connected to MongoDB!\n');

    // Force the database name for consistency
    const dbName = mongoURI.split('/').pop().split('?')[0] || 'uber';
    console.log('📊 Using Database:', dbName);

    // Get database info
    const db = mongoose.connection.db;
    console.log('📋 Database Info:');
    console.log('- Database Name:', db.databaseName);
    console.log('- Host:', mongoose.connection.host);
    console.log('- Port:', mongoose.connection.port);
    console.log('- Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

    // List all collections
    console.log('\n📂 Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });

    // Check users collection specifically
    console.log('\n👥 Checking "users" collection:');
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`- Total users in collection: ${userCount}`);

    if (userCount > 0) {
      const users = await User.find({}, 'name email role isVerified').limit(5);
      console.log('- Sample users:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Verified: ${user.isVerified}`);
      });
    }

    // Test if MongoDB Compass can connect
    console.log('\n🔧 For MongoDB Compass:');
    console.log('- Connection String:', mongoURI);
    console.log('- Database: uber_clone');
    console.log('- Collection: users');

  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error('- Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible Issues:');
      console.log('1. MongoDB is not running');
      console.log('2. Wrong connection string');
      console.log('3. Firewall blocking connection');
      console.log('4. Wrong port (default should be 27017)');
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running: mongod');
    console.log('2. Check if port 27017 is available');
    console.log('3. Verify connection string in .env file');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

checkMongoConnection();
