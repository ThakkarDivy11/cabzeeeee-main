const axios = require('axios');

(async () => {
  try {
    console.log('Testing registration endpoint...');

    const timestamp = Date.now();
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'test123456',
      phone: `${timestamp.toString().slice(-10)}`, // Test phone without + prefix
      role: 'rider'
    });

    console.log('Registration response:', response.data);
    console.log('\n🔍 Check your backend console for the OTP to verify this user!');
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
})();
