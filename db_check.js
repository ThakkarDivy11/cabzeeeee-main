const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const User = require('./backend/models/User');
const Ride = require('./backend/models/Ride');

async function checkStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber-clone');
        console.log('Connected to MongoDB');

        const pendingRides = await Ride.find({ status: 'pending' }).populate('rider', 'name');
        console.log(`\n--- PENDING RIDES: ${pendingRides.length} ---`);
        pendingRides.forEach(r => {
            console.log(`Ride ID: ${r._id}`);
            console.log(`  Rider: ${r.rider?.name || 'Unknown'}`);
            console.log(`  Vehicle Type: ${r.vehicleType}`);
            console.log(`  Created At: ${r.createdAt}`);
        });

        const drivers = await User.find({ role: 'driver' });
        console.log(`\n--- DRIVERS: ${drivers.length} ---`);
        drivers.forEach(d => {
            console.log(`Driver: ${d.name} (${d.email})`);
            console.log(`  Status: ${d.driverStatus}`);
            console.log(`  Vehicle Info: ${JSON.stringify(d.vehicleInfo)}`);
            console.log(`  Verified: ${d.isVerified}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkStatus();
