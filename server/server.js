const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { initializeSocket } = require('./socket');
require('dotenv').config();

console.log('CabZee Server starting...');

const app = express();
const server = http.createServer(app);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://cabzeeeee.vercel.app',
      'http://localhost:3000'
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CabZee API is running',
    timestamp: new Date().toISOString()
  });
});

// Stripe webhook needs raw body, registered BEFORE express.json()
app.use('/api/payments', require('./routes/payment'));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/chat', require('./routes/chat'));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// duplicate health route removed (defined above)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber', {
  maxPoolSize: 3,       // Minimal pool for 512MB free tier
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: false       // Don't auto-build indexes in production (saves memory)
})
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      const User = require('./models/User');
      const existingAdmin = await User.findOne({ email: 'divythakkar318@gmail.com' });

      if (!existingAdmin) {
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync('admin123', salt);

        const adminUser = new User({
          name: 'divy',
          email: 'divythakkar318@gmail.com',
          password: hashedPassword,
          phone: '+1234567890',
          role: 'admin',
          isVerified: true
        });
        await adminUser.save();
        console.log('Default admin user created: divy (divythakkar318@gmail.com) with password: admin123');
      }
    } catch (error) {
      console.error('Error creating default admin user:', error);
    }

    // Initialize default settings
    try {
      const Settings = require('./models/Settings');
      await Settings.getSettings();
      console.log('System settings initialized');
    } catch (error) {
      console.error('Error initializing settings:', error);
    }

    // Initialize Socket.io
    initializeSocket(server);
    console.log('Socket.io initialized');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.io ready for connections`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });