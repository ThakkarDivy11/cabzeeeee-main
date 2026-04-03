const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['rider', 'driver', 'admin'],
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number'
    ]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  vehicleInfo: {
    type: {
      make: String,
      model: String,
      year: Number,
      color: String,
      licensePlate: String,
      vehicleType: {
        type: String,
        enum: ['car', 'bike', 'auto']
      }
    },
    required: false
  },
  driverStatus: {
    type: String,
    enum: ['offline', 'online', 'busy'],
    default: 'offline'
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  stripeCustomerId: {
    type: String,
    default: ''
  },
  savedCards: [{
    last4: String,
    brand: String,
    expiryMonth: String,
    expiryYear: String,
    cardHolderName: String
  }],
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5.0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalRides: {
    type: Number,
    default: 0
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  documents: {
    type: {
      license: {
        number: String,
        expiryDate: Date,
        fileUrl: String,
        verified: { type: Boolean, default: false }
      },
      insurance: {
        number: String,
        expiryDate: Date,
        fileUrl: String,
        verified: { type: Boolean, default: false }
      },
      registration: {
        number: String,
        expiryDate: Date,
        fileUrl: String,
        verified: { type: Boolean, default: false }
      }
    },
    required: false
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ currentLocation: '2dsphere' });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  return otp;
};

userSchema.methods.verifyOTP = function (otpCode) {
  if (!this.otp || !this.otp.code || this.otp.expiresAt < new Date()) {
    return false;
  }
  return this.otp.code === otpCode;
};

userSchema.methods.clearOTP = function () {
  this.otp = undefined;
};

userSchema.virtual('fullName').get(function () {
  return this.name;
});

userSchema.statics.findNearbyDrivers = function (longitude, latitude, maxDistance = 10000) {
  return this.find({
    role: 'driver',
    driverStatus: 'online',
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = mongoose.model('User', userSchema);
