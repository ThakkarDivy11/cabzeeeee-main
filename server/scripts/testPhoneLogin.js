const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testPhoneLogin() {
  try {
    console.log('🧪 Testing Phone Number Login...\n');

    const testCredentials = [
      {
        identifier: 'modipriyanshi013@gmail.com',
        password: 'password123',
        type: 'email',
        expectedUser: 'priyanshi'
      },
      {
        identifier: '+1234564325',
        password: 'password123',
        type: 'phone',
        expectedUser: 'priyanshi'
      },
      {
        identifier: '1234564325',
        password: 'password123',
        type: 'phone (no +)',
        expectedUser: 'priyanshi'
      }
    ];

    for (const cred of testCredentials) {
      console.log(`🔐 Testing ${cred.type} login: ${cred.identifier}`);

      try {
        const loginData = {
          password: cred.password
        };

        if (cred.identifier.includes('@')) {
          loginData.email = cred.identifier;
        } else {
          loginData.phone = cred.identifier;
        }

        const response = await axios.post(`${API_BASE}/login`, loginData);

        if (response.data.success) {
          console.log(`✅ Login successful for ${cred.expectedUser}`);
          console.log(`   Role: ${response.data.data.user.role}`);
          console.log(`   Verified: ${response.data.data.user.isVerified}`);
        } else {
          console.log(`❌ Login failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Login error: ${error.response?.data?.message || error.message}`);
      }

      console.log('');
    }

    console.log('🎯 Testing Admin Phone Login...\n');

    const adminCredentials = [
      {
        identifier: 'divythakkar318@gmail.com',
        password: 'admin123',
        type: 'email'
      },
      {
        identifier: '+1234567890',
        password: 'admin123',
        type: 'phone'
      }
    ];

    for (const cred of adminCredentials) {
      console.log(`👑 Testing admin ${cred.type} login: ${cred.identifier}`);

      try {
        const loginData = {
          password: cred.password
        };

        if (cred.identifier.includes('@')) {
          loginData.email = cred.identifier;
        } else {
          loginData.phone = cred.identifier;
        }

        const response = await axios.post(`${API_BASE}/admin-login`, loginData);

        if (response.data.success) {
          console.log(`✅ Admin login successful`);
          console.log(`   Role: ${response.data.data.user.role}`);
        } else {
          console.log(`❌ Admin login failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Admin login error: ${error.response?.data?.message || error.message}`);
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testPhoneLogin();
