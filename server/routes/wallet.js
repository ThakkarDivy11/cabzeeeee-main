const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Reset wallet balance
// @route   POST /api/wallet/reset
// @access  Private (Admin for other users; self-reset allowed)
router.post('/reset', protect, async (req, res) => {
  const { userId } = req.body;

  try {
    let targetUserId;

    if (userId) {
      // Only admin can reset another user's wallet
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can reset another user\'s wallet.'
        });
      }
      targetUserId = userId;
    } else {
      // No userId provided: reset own wallet
      targetUserId = req.user.id;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found for wallet reset.'
      });
    }

    targetUser.walletBalance = 0;
    await targetUser.save();

    res.json({
      success: true,
      message: 'Wallet reset to ₹0.00 successfully.',
      data: {
        userId: targetUser._id,
        walletBalance: targetUser.walletBalance
      }
    });
  } catch (error) {
    console.error('Wallet reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting wallet.'
    });
  }
});

module.exports = router;
