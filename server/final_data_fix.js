require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const User = require('./models/User');
  const Ride = require('./models/Ride');
  
  // 1. Set all 'divy' to drivers
  const divys = await User.find({ name: /divy/i });
  console.log(`Found ${divys.length} divy users`);
  
  for (const d of divys) {
    d.role = 'driver';
    d.isVerified = true;
    await d.save();
    console.log(`Updated ${d.email} to driver`);
  }
  
  // 2. Assign the accepted ride to divythakkar318@gmail.com
  const target = divys.find(u => u.email === 'divythakkar318@gmail.com') || divys[0];
  if (target) {
    const ride = await Ride.findOne({ status: 'accepted' });
    if (ride) {
      ride.driver = target._id;
      await ride.save();
      console.log(`Assigned ride ${ride._id} to ${target.email}`);
    } else {
      console.log('No accepted ride found');
    }
  }
  
  console.log('Done');
  mongoose.disconnect();
}

fix().catch(console.error);
