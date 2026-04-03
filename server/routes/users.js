const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const sendEmail = require('../utils/email');

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -resetPasswordToken -savedCards').sort({ createdAt: -1 }).limit(200).lean();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', upload.single('profilePicture'), [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().isLength({ min: 10, max: 15 }).matches(/^[\+]?[1-9]\d{9,14}$/).withMessage('Please provide a valid phone number'),
  body('driverStatus').optional().isIn(['offline', 'online', 'busy']).withMessage('Invalid driver status'),
  body('vehicleInfo.vehicleType').optional().isIn(['car', 'bike', 'auto']).withMessage('Invalid vehicle type')
], validateRequest, async (req, res) => {
  try {
    const { name, phone, driverStatus, vehicleInfo } = req.body;
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone.startsWith('+') ? phone : `+${phone}`;
    if (driverStatus) fieldsToUpdate.driverStatus = driverStatus;
    if (vehicleInfo) fieldsToUpdate.vehicleInfo = vehicleInfo;

    if (req.file) {
      fieldsToUpdate.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await User.findOne({ phone: fieldsToUpdate.phone, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all online drivers (optionally nearby)
// @route   GET /api/users/drivers
// @access  Private
router.get('/drivers', protect, async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;
    let drivers;

    if (lat && lon) {
      // Find nearby drivers if coordinates are provided
      drivers = await User.findNearbyDrivers(parseFloat(lon), parseFloat(lat), parseInt(radius) || 10000);
      drivers = drivers.map(d => ({
        _id: d._id,
        name: d.name,
        rating: d.rating,
        totalRides: d.totalRides,
        vehicleInfo: d.vehicleInfo,
        profilePicture: d.profilePicture,
        currentLocation: d.currentLocation
      }));
    } else {
      // Otherwise get all online drivers
      drivers = await User.find({
        role: 'driver',
        driverStatus: 'online'
      }).select('name rating totalRides vehicleInfo profilePicture currentLocation');
    }

    res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// @desc    Add a saved card
// @route   POST /api/users/card
// @access  Private
router.post('/card', protect, [
  body('last4').isLength({ min: 4, max: 4 }),
  body('brand').notEmpty(),
  body('expiryMonth').notEmpty(),
  body('expiryYear').notEmpty(),
  body('cardHolderName').notEmpty()
], validateRequest, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.savedCards) user.savedCards = [];
    user.savedCards.push(req.body);
    await user.save();
    res.json({ success: true, data: user.savedCards });
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Remove a saved card
// @route   DELETE /api/users/card/:id
// @access  Private
router.delete('/card/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.savedCards) {
      user.savedCards = user.savedCards.filter(card => card._id.toString() !== req.params.id);
      await user.save();
    }
    res.json({ success: true, data: user.savedCards || [] });
  } catch (error) {
    console.error('Error removing card:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Add money to wallet
// @route   POST /api/users/wallet/add
// @access  Private
router.post('/wallet/add', protect, [
  body('amount').isNumeric().withMessage('Amount must be a number')
], validateRequest, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    user.walletBalance = (user.walletBalance || 0) + parseFloat(amount);
    await user.save();
    res.json({ success: true, data: { walletBalance: user.walletBalance } });
  } catch (error) {
    console.error('Error adding money:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Upload user document (Driver only)
// @route   POST /api/users/documents/upload
// @access  Private
router.post('/documents/upload', protect, upload.single('document'), [
  body('type').isIn(['license', 'insurance', 'registration']).withMessage('Invalid document type'),
  body('number').optional().notEmpty().withMessage('Document number is required')
    .custom((value, { req }) => {
      if (req.body.type === 'license') {
        const licenseRegex = /^[A-Z]{2}[0-9]{13,14}$/;
        if (!licenseRegex.test(value)) {
          throw new Error('Invalid Driving License format. Expected 15-16 characters (e.g., MH1420110062821)');
        }
      }
      if (req.body.type === 'insurance') {
        // Alphanumeric, 8-13 characters
        const insuranceRegex = /^[A-Z0-9]{8,13}$/;
        if (!insuranceRegex.test(value)) {
          throw new Error('Invalid Insurance Policy format. Expected 8-13 alphanumeric characters');
        }
      }
      if (req.body.type === 'registration') {
        // Indian RC format: SS-RR-SS-NNNN or SSRRSSNNNN
        // SSRR: State+RTO, SS: Series (1-3 chars), NNNN: 4 digit ID
        const rcRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;
        if (!rcRegex.test(value)) {
          throw new Error('Invalid RC Number format. Expected format like MH01AB1234');
        }
      }
      return true;
    }),
  body('expiryDate').optional().isISO8601().toDate().withMessage('Invalid expiry date')
], validateRequest, async (req, res) => {
  console.log('Document upload attempt:', {
    userId: req.user?.id,
    file: req.file ? { name: req.file.originalname, mimetype: req.file.mimetype } : 'No file',
    body: req.body
  });
  try {
    if (!req.file) {
      console.warn('Upload failed: No file provided in request');
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { type, number, expiryDate } = req.body;
    const documentPath = `/uploads/${req.file.filename}`;

    const updateQuery = {};
    updateQuery[`documents.${type}.fileUrl`] = documentPath;
    if (number) updateQuery[`documents.${type}.number`] = number;
    if (expiryDate) updateQuery[`documents.${type}.expiryDate`] = expiryDate;
    updateQuery[`documents.${type}.verified`] = false; // Reset verification on new upload

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateQuery },
      { new: true }
    );

    res.json({
      success: true,
      message: `${type} uploaded successfully`,
      data: user.documents[type]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Verify user document (Admin only)
// @route   PUT /api/users/documents/:userId/verify
// @access  Private/Admin
router.put('/documents/:userId/verify', protect, authorize('admin'), [
  body('type').isIn(['license', 'insurance', 'registration']).withMessage('Invalid document type'),
  body('status').isBoolean().withMessage('Status must be boolean (true for verified, false for rejected)')
], validateRequest, async (req, res) => {

  try {
    const { type, status, rejectReason } = req.body;
    const { userId } = req.params;

    const updateQuery = {};
    updateQuery[`documents.${type}.verified`] = status;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateQuery },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send email notification (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Document Verification - CabZee',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">CabZee Document Update</h2>

      <p>Hello ${user.name || 'User'},</p>

      <p>
        Your submitted document <strong>${type}</strong> has been
        <strong style="color: ${status === false ? '#dc3545' : '#28a745'};">
          ${status ? 'Approved' : 'Rejected'}
        </strong>.
      </p>

      <div style="
        background-color: ${status === false ? '#3b1317ff' : '#024a27ff'};
        padding: 20px;
        border-radius: 5px;
        margin: 20px 0;
      ">
        <p style="margin: 0;">
          <strong>Document Type:</strong> ${type}
        </p>
        <p style="margin: 8px 0 0;">
          <strong>Status:</strong>
          <span style="color: ${status === false ? '#dc3545' : '#28a745'};">
            ${status ? 'Approved' : 'Rejected'}
          </span>
        </p>

        ${status === false && rejectReason
            ? `<p style="margin-top: 10px; color: #dc3545;">
               <strong>Reason:</strong> ${rejectReason}
             </p>`
            : ''
          }
      </div>

      ${status === true
            ? `<p>Your ${type} is Approved. You can check it from the Driver Verification Portal in CabZee.</p>`
            : `<p>Please re-upload the correct document to proceed further.</p>`
          }

      <p>If you have any questions, feel free to contact our support team.</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

      <p style="color: #666; font-size: 12px;">
        CabZee - Your Ride, Your Way
      </p>
    </div>`
      });
      console.log(`✅ Document verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.log(`⚠️  Document verified but email notification failed for ${user.email}`);
      // Don't block the response - document verification succeeded even if email failed
    }

    res.json({
      success: true,
      message: `Document ${status ? 'verified' : 'rejected'} successfully`,
      data: user.documents[type]
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
