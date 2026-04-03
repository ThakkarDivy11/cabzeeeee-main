const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Ride = require('./models/Ride');

async function createManualRide() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber-clone');
        console.log('Connected');

        const rider = await User.findOne({ role: 'rider' });
        if (!rider) {
            console.log('No rider found to associate with ride');
            process.exit(1);
        }

        const ride = new Ride({
            rider: rider._id,
            pickupLocation: {
                address: 'Manual Test Pickup',
                coordinates: [72.5714, 23.0225]
            },
            dropLocation: {
                address: 'Manual Test Drop',
                coordinates: [72.5850, 23.0333]
            },
            fare: 200,
            distance: 6,
            estimatedTime: 20,
            vehicleType: 'car',
            status: 'pending'
        });

        await ride.save();
        console.log(`✅ MANUAL RIDE CREATED: ${ride._id}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createManualRide();
