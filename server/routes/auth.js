const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const upload = require('../middleware/upload');

const router = express.Router();

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is missing');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRefreshToken = (userId) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    console.error('CRITICAL: REFRESH_TOKEN_SECRET is not defined in environment variables');
    throw new Error('REFRESH_TOKEN_SECRET is missing');
  }
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d'
  });
};

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

router.post('/register', upload.single('profilePicture'), [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isLength({ min: 10, max: 15 }).matches(/^[\+]?[1-9]\d{9,14}$/).withMessage('Please provide a valid phone number (10-15 digits)'),
  body('role').isIn(['rider', 'driver']).withMessage('Role must be rider or driver')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password, phone: rawPhone, role } = req.body;
    let profilePicture = '';

    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }
    const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

    const existingUser = await User.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, 'i') },
        { phone }
      ]
    });

    if (existingUser) {
      console.log(`Registration blocked: User already exists with email: ${email} or phone: ${phone}`);
      console.log(`Existing user: ${existingUser.email} (${existingUser.phone})`);
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      profilePicture: profilePicture || ''
    });

    await user.save();

    const otp = user.generateOTP();
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - CabZee',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to CabZee!</h2>
            <p>Thank you for registering with CabZee. Your verification code is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">${otp}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">CabZee - Your Ride, Your Way</p>
          </div>
        `
      });
      console.log(`✅ OTP sent to ${email}: ${otp}`);
      console.log(`🔑 COPY THIS OTP: ${otp} (for email: ${email})`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.log(`⚠️  Email failed, but OTP generated: ${otp} for ${email}`);
      console.log(`🔑 TEMPORARY: Use OTP ${otp} to verify ${email} (check console for this message)`);
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

router.post('/admin-login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture
    };

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
  body('role').optional().isIn(['rider', 'driver', 'admin']).withMessage('Invalid role')
], validateRequest, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (role && user.role !== role) {
      console.log(`Login failed: Role mismatch for ${email}. Expected ${role}, got ${user.role}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials for this role'
      });
    }

    if (!user.isVerified) {
      console.log(`Login blocked: User not verified - ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    console.log(`Login successful: ${email} (${user.role})`);

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      rating: user.rating,
      totalRides: user.totalRides,
      profilePicture: user.profilePicture,
      documents: user.documents
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits')
], validateRequest, async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.isVerified = true;
    user.clearOTP();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture
    };

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('OTP verification error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: error.message // Sending back error message for easier debugging
    });
  }
});

router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    const now = new Date();
    if (user.otpExpiresAt && (now - user.otpExpiresAt) < 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 1 minute before requesting a new OTP.'
      });
    }

    const otp = user.generateOTP();
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: 'New Verification Code - CabZee',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Verification Code</h2>
            <p>Hello,</p>
            <p>Your new verification code for CabZee is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">${otp}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">CabZee - Your Ride, Your Way</p>
          </div>
        `
      });

      res.json({
        success: true,
        message: 'New OTP sent to your email'
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.log(`🔑 TEMPORARY RESEND: Use OTP ${otp} to verify ${email} (check console for this message)`);
      res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - CabZee',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your CabZee account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/reset-password', [
  body('token').exists().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/refresh-token', [
  body('refreshToken').exists().withMessage('Refresh token is required')
], validateRequest, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
