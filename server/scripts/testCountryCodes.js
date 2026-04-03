const axios = require('axios');

async function testCountryCodes() {
  try {
    console.log('🌍 Testing Country Codes API...\n');

    const response = await axios.get('http://localhost:5000/api/auth/country-codes');

    console.log('✅ Country codes loaded successfully!');
    console.log(`📊 Total countries: ${response.data.data.length}`);
    console.log('\n🌟 Sample countries:');
    response.data.data.slice(0, 10).forEach((country, index) => {
      console.log(`${index + 1}. ${country.flag} ${country.name} (${country.code})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testCountryCodes();

