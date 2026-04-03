const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api/auth';

async function verifyFix() {
    try {
        console.log('🚀 Starting verification...');

        // 1. Register a new user
        const timestamp = Date.now();
        const email = `test_verification_${timestamp}@example.com`;
        const password = 'password123';

        console.log(`📝 Registering user: ${email}...`);
        const registerRes = await axios.post(`${API_BASE}/register`, {
            name: 'Verification User',
            email: email,
            password: password,
            phone: `+1${timestamp.toString().slice(-10)}`,
            role: 'rider'
        });

        if (!registerRes.data.success) {
            throw new Error('Registration failed');
        }
        console.log('✅ Registration successful.');

        // 2. Fetch OTP from database
        console.log('🔍 Connecting to MongoDB to fetch OTP...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uber-clone');
        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otp.code) {
            throw new Error('OTP not found in database');
        }
        const otp = user.otp.code;
        console.log(`✅ OTP found: ${otp}`);

        // 3. Verify OTP
        console.log('🔐 Verifying OTP...');
        const verifyRes = await axios.post(`${API_BASE}/verify-otp`, {
            email,
            otp
        });

        if (!verifyRes.data.success) {
            throw new Error('OTP Verification failed');
        }
        console.log('✅ OTP Verification successful.');
        console.log('Tokens received:', {
            token: verifyRes.data.data.token ? 'YES' : 'NO',
            refreshToken: verifyRes.data.data.refreshToken ? 'YES' : 'NO'
        });

        // 4. Test Login
        console.log('🔑 Testing Login...');
        const loginRes = await axios.post(`${API_BASE}/login`, {
            email,
            password,
            role: 'rider'
        });

        if (!loginRes.data.success) {
            throw new Error('Login failed');
        }
        console.log('✅ Login successful.');
        console.log('Tokens received:', {
            token: loginRes.data.data.token ? 'YES' : 'NO',
            refreshToken: loginRes.data.data.refreshToken ? 'YES' : 'NO'
        });

        console.log('\n🎉 ALL TESTS PASSED! The server errors are fixed.');

    } catch (error) {
        console.error('\n❌ Verification failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

verifyFix();
