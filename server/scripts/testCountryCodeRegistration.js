const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testCountryCodeRegistration() {
  try {
    console.log('🌍 Testing Country Code Registration...\n');

    console.log('1️⃣ Getting Country Codes...');
    const countriesResponse = await axios.get(`${API_BASE}/country-codes`);
    console.log(`✅ Found ${countriesResponse.data.data.length} countries`);
    console.log('Sample countries:');
    countriesResponse.data.data.slice(0, 5).forEach(country => {
      console.log(`  ${country.flag} ${country.name} (${country.code})`);
    });
    console.log('');

    const testCountries = [
      { code: '+1', name: 'US', phone: '2345678901' },
      { code: '+91', name: 'India', phone: '9876543210' },
      { code: '+44', name: 'UK', phone: '7123456789' }
    ];

    for (const country of testCountries) {
      console.log(`📞 Testing registration for ${country.name} (${country.code})...`);

      try {
        const timestamp = Date.now();
        const response = await axios.post(`${API_BASE}/register`, {
          name: `Test User ${country.name}`,
          email: `test${country.code.replace('+', '')}${timestamp}@example.com`,
          password: 'password123',
          countryCode: country.code,
          phoneNumber: country.phone,
          role: 'rider'
        });

        if (response.data.success) {
          console.log(`✅ Registration successful for ${country.name}`);
          console.log(`   Email: ${response.data.data.email}`);
          console.log(`   Phone: ${response.data.data.phone}`);
        } else {
          console.log(`❌ Registration failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Registration error: ${error.response?.data?.message || error.message}`);
      }

      console.log('');
    }

    console.log('🎯 Testing Phone Login with Country Codes...\n');

    for (const country of testCountries) {
      console.log(`🔐 Testing phone login for ${country.name}...`);

      try {
        const response = await axios.post(`${API_BASE}/login`, {
          phone: `${country.code}${country.phone}`,
          password: 'password123'
        });

        if (response.data.success) {
          console.log(`✅ Phone login successful for ${country.name}`);
        } else {
          console.log(`❌ Phone login failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Phone login error: ${error.response?.data?.message || error.message}`);
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCountryCodeRegistration();

