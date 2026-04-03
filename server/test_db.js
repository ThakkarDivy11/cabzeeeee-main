const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI || 'mongodb://localhost:27017/uber');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected!');
        const count = await User.countDocuments();
        console.log('User count:', count);
        const admin = await User.findOne({ role: 'admin' });
        console.log('Admin user found:', admin ? admin.email : 'None');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

test();
