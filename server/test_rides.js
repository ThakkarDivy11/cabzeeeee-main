require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const Ride = require('./models/Ride');
  
  const rides = await Ride.find().sort({ createdAt: -1 }).limit(5);
  console.log('Recent Rides:', rides.map(r => ({
    _id: r._id,
    driver: r.driver,
    rider: r.rider,
    status: r.status,
    fare: r.fare
  })));
  
  mongoose.disconnect();
}

check().catch(console.error);
