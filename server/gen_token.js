require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function gen() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('./models/User');
  const user = await User.findOne({ email: 'divyt717@gmail.com' });
  if (!user) throw new Error('User not found');
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  console.log(token);
  mongoose.disconnect();
}

gen().catch(console.error);
