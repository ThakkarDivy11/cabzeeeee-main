require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const Ride = require('./models/Ride');
  
  const ride = await Ride.findOne({ status: 'accepted' });
  if (ride) {
    ride.driver = '698988ac1a97c3ad073eede5';
    await ride.save();
    console.log(`Reassigned ride ${ride._id} to 698988ac1a97c3ad073eede5 (divyt717@gmail.com)`);
  } else {
    console.log('No accepted ride found');
  }
  
  console.log('Done');
  mongoose.disconnect();
}

fix().catch(console.error);
