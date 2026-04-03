const axios = require('axios');

async function testFrontendCountryCodes() {
  try {
    console.log('🌐 Testing Frontend Country Codes Fetch...\n');

    console.log('Fetching from: http://localhost:5000/api/auth/country-codes');

    const response = await axios.get('http://localhost:5000/api/auth/country-codes');
    const data = response.data;

    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Success:', data.success);

    if (data.success && data.data) {
      console.log(`✅ Countries Loaded: ${data.data.length}`);
      console.log('\n🌟 First 10 Countries:');
      data.data.slice(0, 10).forEach((country, index) => {
        console.log(`${index + 1}. ${country.flag} ${country.name} (${country.code})`);
      });

      console.log('\n🔍 Checking Data Structure:');
      const sample = data.data[0];
      console.log('Sample Country Object:', {
        code: sample.code,
        name: sample.name,
        flag: sample.flag
      });

      console.log('\n📊 Country Code Distribution:');
      const codesByLength = {};
      data.data.forEach(country => {
        const length = country.code.length - 1; // -1 for the +
        codesByLength[length] = (codesByLength[length] || 0) + 1;
      });
      console.log('Code lengths:', codesByLength);

    } else {
      console.log('❌ Failed to load countries:', data);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFrontendCountryCodes();
