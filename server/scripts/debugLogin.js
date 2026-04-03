const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function debugLogin() {
  try {
    console.log('🔍 Debugging Login...\n');

    console.log('Testing simple email login...');
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: 'divythakkar318@gmail.com',
        password: 'admin123'
      });
      console.log('✅ Email login success:', response.data.success);
    } catch (error) {
      console.log('❌ Email login failed:', error.response?.data?.message);
    }

    console.log('\nTesting phone login...');
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        phone: '+1234567890',
        password: 'admin123'
      });
      console.log('✅ Phone login success:', response.data.success);
    } catch (error) {
      console.log('❌ Phone login failed:', error.response?.data?.message);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
      }
    }

    console.log('\nTesting admin phone login...');
    try {
      const response = await axios.post(`${API_BASE}/admin-login`, {
        phone: '+1234567890',
        password: 'admin123'
      });
      console.log('✅ Admin phone login success:', response.data.success);
    } catch (error) {
      console.log('❌ Admin phone login failed:', error.response?.data?.message);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugLogin();

