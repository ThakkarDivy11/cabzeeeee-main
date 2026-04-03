const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function verifyDhruvOTP() {
  try {
    console.log('🔐 Verifying OTP for dhruvudhwani123@gmail.com...');

    const response = await axios.post(`${API_BASE}/verify-otp`, {
      email: 'dhruvudhwani123@gmail.com',
      otp: '331635'
    });

    console.log('✅ OTP verification successful!');
    console.log('Response:', response.data);

    console.log('\n🎉 Account verified! You can now login with:');
    console.log('📧 Email: dhruvudhwani123@gmail.com');
    console.log('🔑 Password: password123');
    console.log('👤 Role: rider');

  } catch (error) {
    console.error('❌ OTP verification failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

verifyDhruvOTP();





