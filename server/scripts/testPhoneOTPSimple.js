const axios = require('axios');

async function testPhoneOTPSimple() {
  try {
    console.log('📱 Testing Phone OTP Routes...\n');

    console.log('Testing /api/auth/send-phone-otp...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-phone-otp', {
        phone: '+1234564325'
      });
      console.log('✅ Send OTP Success:', response.data);
    } catch (error) {
      console.log('❌ Send OTP Failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\nTesting /api/auth/login-phone-otp...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login-phone-otp', {
        phone: '+1234564325',
        otp: '110988'
      });
      console.log('✅ Login OTP Success!');
      console.log('User:', response.data.data.user.name);
      console.log('Role:', response.data.data.user.role);
      console.log('Token generated:', !!response.data.data.token);
    } catch (error) {
      console.log('❌ Login OTP Failed:', error.response?.status, error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testPhoneOTPSimple();
