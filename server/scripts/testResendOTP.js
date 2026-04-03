const axios = require('axios');

(async () => {
  try {
    console.log('Testing resend OTP endpoint...');

    const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
      email: 'dhruvudhwani123@gmail.com' // Test with the user's email
    });

    console.log('Resend OTP response:', response.data);
  } catch (error) {
    console.error('Resend OTP failed:', error.response?.data || error.message);
  }
})();

