const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testPhoneOTPLogin() {
  try {
    console.log('📱 Testing Phone OTP Login System...\n');

    const phoneNumber = '+1234564325';

    console.log(`🔐 Testing phone: ${phoneNumber}\n`);

    console.log('1️⃣ Step 1: Send OTP to phone');
    try {
      const sendResponse = await axios.post(`${API_BASE}/send-phone-otp`, {
        phone: phoneNumber
      });

      if (sendResponse.data.success) {
        console.log('✅ OTP sent successfully');
        console.log('📧 Check backend console for the OTP code\n');
      } else {
        console.log('❌ Failed to send OTP:', sendResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Send OTP error:', error.response?.data?.message);
      return;
    }

    console.log('2️⃣ Step 2: Login with OTP (replace XXXX with actual OTP)');
    console.log('Example login command:');
    console.log(`curl -X POST ${API_BASE}/login-phone-otp \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"phone": "${phoneNumber}", "otp": "XXXXXX"}'`);
    console.log('');

    console.log('📋 Manual Testing:');
    console.log(`Phone: ${phoneNumber}`);
    console.log('OTP: Check backend console logs');
    console.log('');

    console.log('🔄 Test Flow:');
    console.log('1. Check backend console for OTP');
    console.log('2. Use OTP in login request');
    console.log('3. Should get JWT tokens on success');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testPhoneOTPLogin();

