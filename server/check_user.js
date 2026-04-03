require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const User = require('./models/User');
  
  const users = await User.find({ name: /divy/i });
  console.log('Matching Users:', users.map(u => ({
    _id: u._id,
    name: u.name,
    role: u.role
  })));
  
  mongoose.disconnect();
}

check().catch(console.error);
