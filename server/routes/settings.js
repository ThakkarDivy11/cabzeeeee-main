const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// Get current settings (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const settings = await Settings.getSettings();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
});

// Update settings (Admin only)
router.put('/', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const settings = await Settings.getSettings();

        // Update allowed fields
        const allowedFields = [
            'appName',
            'supportEmail',
            'supportPhone',
            'baseFare',
            'perKmRate',
            'perMinuteRate',
            'cancellationFee',
            'driverCommissionPercentage',
            'enableEmailNotifications',
            'enableSmsNotifications'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        settings.lastUpdatedBy = req.user.userId;
        await settings.save();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
});

module.exports = router;
