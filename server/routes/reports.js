const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ride = require('../models/Ride');
const { protect } = require('../middleware/auth');

// Helper function to check admin role
const checkAdmin = (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
        return false;
    }
    return true;
};

// Get overview statistics
router.get('/overview', protect, async (req, res) => {
    try {
        if (!checkAdmin(req, res)) return;

        const [totalUsers, totalRides, completedRides, activeDrivers] = await Promise.all([
            User.countDocuments(),
            Ride.countDocuments(),
            Ride.countDocuments({ status: 'completed' }),
            User.countDocuments({ role: 'driver', driverStatus: 'online' })
        ]);

        // Calculate total revenue from completed rides
        const revenueResult = await Ride.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$fare' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalRides,
                completedRides,
                activeDrivers,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overview statistics'
        });
    }
});

// Get user statistics
router.get('/users', protect, async (req, res) => {
    try {
        if (!checkAdmin(req, res)) return;

        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [totalUsers, riders, drivers, admins, newUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'rider' }),
            User.countDocuments({ role: 'driver' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments(dateFilter)
        ]);

        // Get verified vs unverified users
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const unverifiedUsers = totalUsers - verifiedUsers;

        res.json({
            success: true,
            data: {
                totalUsers,
                usersByRole: {
                    riders,
                    drivers,
                    admins
                },
                newUsers,
                verifiedUsers,
                unverifiedUsers
            }
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics'
        });
    }
});

// Get ride statistics
router.get('/rides', protect, async (req, res) => {
    try {
        if (!checkAdmin(req, res)) return;

        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [
            totalRides,
            pendingRides,
            acceptedRides,
            completedRides,
            cancelledRides
        ] = await Promise.all([
            Ride.countDocuments(dateFilter),
            Ride.countDocuments({ ...dateFilter, status: 'pending' }),
            Ride.countDocuments({ ...dateFilter, status: 'accepted' }),
            Ride.countDocuments({ ...dateFilter, status: 'completed' }),
            Ride.countDocuments({ ...dateFilter, status: 'cancelled' })
        ]);

        // Calculate average fare and distance
        const avgStats = await Ride.aggregate([
            { $match: { status: 'completed', ...dateFilter } },
            {
                $group: {
                    _id: null,
                    avgFare: { $avg: '$fare' },
                    avgDistance: { $avg: '$distance' }
                }
            }
        ]);

        const averageFare = avgStats.length > 0 ? avgStats[0].avgFare : 0;
        const averageDistance = avgStats.length > 0 ? avgStats[0].avgDistance : 0;

        res.json({
            success: true,
            data: {
                totalRides,
                ridesByStatus: {
                    pending: pendingRides,
                    accepted: acceptedRides,
                    completed: completedRides,
                    cancelled: cancelledRides
                },
                averageFare: averageFare.toFixed(2),
                averageDistance: averageDistance.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error fetching ride statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ride statistics'
        });
    }
});

// Get revenue statistics
router.get('/revenue', protect, async (req, res) => {
    try {
        if (!checkAdmin(req, res)) return;

        const { startDate, endDate } = req.query;
        const dateFilter = { status: 'completed' };

        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Calculate total revenue
        const revenueResult = await Ride.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, total: { $sum: '$fare' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate revenue by payment method
        const revenueByPayment = await Ride.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$paymentMethod',
                    total: { $sum: '$fare' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate revenue by vehicle type
        const revenueByVehicle = await Ride.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$vehicleType',
                    total: { $sum: '$fare' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const completedRidesCount = await Ride.countDocuments(dateFilter);
        const averageFare = completedRidesCount > 0 ? totalRevenue / completedRidesCount : 0;

        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenue.toFixed(2),
                averageFare: averageFare.toFixed(2),
                completedRides: completedRidesCount,
                revenueByPaymentMethod: revenueByPayment,
                revenueByVehicleType: revenueByVehicle
            }
        });
    } catch (error) {
        console.error('Error fetching revenue statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue statistics'
        });
    }
});

// Get driver performance statistics
router.get('/drivers', protect, async (req, res) => {
    try {
        if (!checkAdmin(req, res)) return;

        const [totalDrivers, onlineDrivers, offlineDrivers, verifiedDrivers] = await Promise.all([
            User.countDocuments({ role: 'driver' }),
            User.countDocuments({ role: 'driver', driverStatus: 'online' }),
            User.countDocuments({ role: 'driver', driverStatus: 'offline' }),
            User.countDocuments({ role: 'driver', isVerified: true })
        ]);

        // Get top drivers by total rides
        const topDrivers = await User.find({ role: 'driver' })
            .sort({ totalRides: -1 })
            .limit(10)
            .select('name email totalRides rating');

        // Calculate average driver rating
        const avgRatingResult = await User.aggregate([
            { $match: { role: 'driver' } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        const averageRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        res.json({
            success: true,
            data: {
                totalDrivers,
                onlineDrivers,
                offlineDrivers,
                verifiedDrivers,
                averageRating: averageRating.toFixed(2),
                topDrivers
            }
        });
    } catch (error) {
        console.error('Error fetching driver statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch driver statistics'
        });
    }
});

module.exports = router;
