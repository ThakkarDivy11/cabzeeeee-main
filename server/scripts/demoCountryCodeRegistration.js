const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function demoCountryCodeRegistration() {
  try {
    console.log('🎯 Country Code Registration Demo\n');

    console.log('1️⃣ Getting Available Country Codes...');
    const countriesResponse = await axios.get(`${API_BASE}/country-codes`);
    const countries = countriesResponse.data.data;
    console.log(`✅ Found ${countries.length} countries\n`);

    console.log('📋 Popular Country Codes:');
    const popularCountries = [
      { name: 'United States', code: '+1', phone: '2345678901' },
      { name: 'India', code: '+91', phone: '9876543210' },
      { name: 'United Kingdom', code: '+44', phone: '7123456789' },
      { name: 'Canada', code: '+1', phone: '2345678901' },
      { name: 'Australia', code: '+61', phone: '412345678' },
      { name: 'Germany', code: '+49', phone: '15123456789' }
    ];

    popularCountries.forEach(country => {
      console.log(`  ${country.name}: ${country.code} (Example: ${country.phone})`);
    });
    console.log('');

    console.log('2️⃣ Testing Registration with Country Codes...\n');

    for (const country of popularCountries.slice(0, 3)) {
      console.log(`🌍 Registering user from ${country.name}...`);

      const timestamp = Date.now();
      const registrationData = {
        name: `Test User ${country.name}`,
        email: `test${country.code.replace('+', '')}${timestamp}@example.com`,
        password: 'password123',
        countryCode: country.code,
        phoneNumber: country.phone,
        role: 'rider'
      };

      console.log(`📝 Registration Data:`);
      console.log(`   Name: ${registrationData.name}`);
      console.log(`   Email: ${registrationData.email}`);
      console.log(`   Country Code: ${registrationData.countryCode}`);
      console.log(`   Phone Number: ${registrationData.phoneNumber}`);
      console.log(`   Full Phone: ${registrationData.countryCode}${registrationData.phoneNumber}`);

      try {
        const response = await axios.post(`${API_BASE}/register`, registrationData);

        if (response.data.success) {
          console.log(`✅ Registration successful!`);
          console.log(`   User ID: ${response.data.data._id}`);
          console.log(`   Stored Phone: ${response.data.data.phone}`);
        } else {
          console.log(`❌ Registration failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Registration error: ${error.response?.data?.message || error.message}`);
      }

      console.log('');
    }

    console.log('3️⃣ Testing Login with Different Methods...\n');

    const testUser = popularCountries[0];
    const testEmail = `test${testUser.code.replace('+', '')}${Date.now() - 1000}@example.com`;

    console.log(`🔐 Testing login methods for ${testUser.name} user...`);

    const loginMethods = [
      {
        name: 'Email + Password',
        data: { email: testEmail, password: 'password123' }
      },
      {
        name: 'Phone + Password',
        data: { phone: `${testUser.code}${testUser.phone}`, password: 'password123' }
      }
    ];

    for (const method of loginMethods) {
      console.log(`   Testing ${method.name}...`);

      try {
        const response = await axios.post(`${API_BASE}/login`, method.data);

        if (response.data.success) {
          console.log(`   ✅ Login successful`);
        } else {
          console.log(`   ⚠️  Login requires email verification: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Login failed: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎯 API Endpoints Summary:');
    console.log('GET  /api/auth/country-codes  - Get all country codes');
    console.log('POST /api/auth/register       - Register with country code');
    console.log('POST /api/auth/login          - Login (email or phone)');
    console.log('POST /api/auth/send-phone-otp - Send OTP to phone');
    console.log('POST /api/auth/login-phone-otp - Login with phone OTP');

  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

demoCountryCodeRegistration();

