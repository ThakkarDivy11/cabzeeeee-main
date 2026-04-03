const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
const dotenv = require('dotenv');

dotenv.config();

const checkDrivers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber-clone');
        console.log('Connected to MongoDB');

        const drivers = await User.find({ role: 'driver' });

        if (drivers.length === 0) {
            console.log('No drivers found in the database.');
        } else {
            console.log(`Found ${drivers.length} drivers:`);
            drivers.forEach(d => {
                console.log(`- Name: ${d.name}, Status: ${d.driverStatus}, ID: ${d._id}`);
            });
        }

        const onlineDrivers = await User.find({ role: 'driver', driverStatus: 'online' });
        console.log(`Total Online Drivers: ${onlineDrivers.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDrivers();
