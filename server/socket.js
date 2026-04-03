const socketIO = require('socket.io');
const Ride = require('./models/Ride');
const User = require('./models/User');

let io;

// Throttle map to prevent excessive location updates (one per 3s per ride)
const locationThrottle = new Map();
const THROTTLE_MS = 3000;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                'https://cabzeeeee.vercel.app',
                'http://localhost:3000'
            ].filter(Boolean),
            credentials: true
        },
        // Memory-optimized settings for free tier
        maxHttpBufferSize: 16 * 1024, // 16KB max message size
        pingInterval: 25000,
        pingTimeout: 20000,
        perMessageDeflate: false, // Disable compression to save memory
        connectTimeout: 10000
    });

    io.on('connection', (socket) => {
        // Join a ride room to receive updates
        socket.on('join-ride', (rideId) => {
            socket.join(`ride-${rideId}`);
        });

        // Leave a ride room
        socket.on('leave-ride', (rideId) => {
            socket.leave(`ride-${rideId}`);
        });

        // Driver sends location update (memory-efficient: atomic update, throttled)
        socket.on('driver-location-update', async (data) => {
            const { rideId, latitude, longitude } = data;
            if (!rideId || !latitude || !longitude) return;

            // Throttle: skip if last update was less than 3s ago
            const lastUpdate = locationThrottle.get(rideId);
            const now = Date.now();
            if (lastUpdate && (now - lastUpdate) < THROTTLE_MS) {
                // Still broadcast to clients for smooth UI, but skip DB write
                io.to(`ride-${rideId}`).emit('location-updated', {
                    latitude, longitude, timestamp: new Date()
                });
                return;
            }
            locationThrottle.set(rideId, now);

            try {
                // Use atomic update — never loads the full document into memory
                const result = await Ride.findByIdAndUpdate(rideId, {
                    $set: {
                        currentDriverLocation: {
                            latitude,
                            longitude,
                            timestamp: new Date()
                        }
                    },
                    $push: {
                        locationHistory: {
                            $each: [{ latitude, longitude, timestamp: new Date() }],
                            $slice: -50  // Keep only the last 50 location points
                        }
                    }
                }, { new: false, projection: { _id: 1 } }); // Return minimal data

                if (result) {
                    // Broadcast to all clients in the ride room
                    io.to(`ride-${rideId}`).emit('location-updated', {
                        latitude,
                        longitude,
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Error updating driver location:', error.message);
            }
        });

        // Ride status changed
        socket.on('ride-status-changed', (data) => {
            const { rideId, status } = data;
            io.to(`ride-${rideId}`).emit('status-updated', { status });
        });

        // OTP verified
        socket.on('otp-verified', (data) => {
            const { rideId } = data;
            io.to(`ride-${rideId}`).emit('otp-verification-success', data);
        });

        // AI ChatBot bookings
        socket.on('book-ride', async (data) => {
            const { pickup, destination, datetime, source } = data;

            try {
                // Find an available driver
                const availableDriver = await User.findOne({
                    role: 'driver',
                    driverStatus: 'online'
                }).select('_id name driverStatus vehicleInfo').lean();

                // Get a rider ID
                const rider = await User.findOne({ role: 'rider' }).select('_id').lean();

                const ride = new Ride({
                    rider: rider ? rider._id : '65bbae123456789012345678',
                    pickupLocation: {
                        address: pickup,
                        coordinates: [72.8777, 19.0760]
                    },
                    dropLocation: {
                        address: destination,
                        coordinates: [72.8777, 19.0760]
                    },
                    fare: Math.floor(Math.random() * 500) + 100,
                    status: availableDriver ? 'accepted' : 'pending',
                    driver: availableDriver ? availableDriver._id : null,
                    vehicleType: availableDriver?.vehicleInfo?.vehicleType || 'car',
                    specialInstructions: `Booked via AI Assistant on ${datetime}`,
                    acceptedAt: availableDriver ? new Date() : null,
                    pickupOTP: Math.floor(1000 + Math.random() * 9000).toString()
                });

                // If driver assigned, mark them as busy
                if (availableDriver) {
                    await User.findByIdAndUpdate(availableDriver._id, { driverStatus: 'busy' });
                }

                await ride.save();

                // Response back to the bot
                socket.emit('ride-booked-confirmed', {
                    success: true,
                    rideId: ride._id,
                    driverName: availableDriver ? availableDriver.name : 'Searching...',
                    fare: ride.fare
                });

            } catch (error) {
                console.error('AI Booking Error:', error.message);
                socket.emit('ride-booked-confirmed', { success: false, message: error.message });
            }
        });

        socket.on('disconnect', () => {
            // Clean up throttle entries for disconnected sockets
        });
    });

    // Periodically clean up stale throttle entries (every 60s)
    setInterval(() => {
        const now = Date.now();
        for (const [key, ts] of locationThrottle) {
            if (now - ts > 60000) locationThrottle.delete(key);
        }
    }, 60000);

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initializeSocket, getIO };
