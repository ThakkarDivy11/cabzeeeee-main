const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // General Settings
    appName: {
        type: String,
        default: 'CabZee'
    },
    supportEmail: {
        type: String,
        default: 'support@cabzee.com'
    },
    supportPhone: {
        type: String,
        default: '+1234567890'
    },

    // Pricing Settings
    baseFare: {
        type: Number,
        default: 50,
        min: 0
    },
    perKmRate: {
        type: Number,
        default: 10,
        min: 0
    },
    perMinuteRate: {
        type: Number,
        default: 2,
        min: 0
    },
    cancellationFee: {
        type: Number,
        default: 20,
        min: 0
    },

    // Commission Settings
    driverCommissionPercentage: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
    },

    // Feature Toggles
    enableEmailNotifications: {
        type: Boolean,
        default: true
    },
    enableSmsNotifications: {
        type: Boolean,
        default: false
    },

    // Metadata
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
