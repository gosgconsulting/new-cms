/**
 * Simple Google API Integration Test
 * Basic test to verify Google API functionality without TypeScript dependencies
 */

console.log('[testing] Starting Google API Integration Test...');

// Test configuration
const TEST_CONFIG = {
  apiKey: process.env.VITE_GOOGLE_API_KEY || '',
  testQueries: [
    'restaurants in New York',
    'hotels in Paris',
    'coffee shops near me'
  ],
  testTranslations: [
    { text: 'Hello world', from: 'en', to: 'es' },
    { text: 'Good morning', from: 'en', to: 'fr' },
    { text: 'Thank you', from: 'en', to: 'de' }
  ]
};

/**
 * Test Google Places API
 */
async function testGooglePlaces() {
  console.log('\n[testing] === Testing Google Places API ===');
  
  if (!TEST_CONFIG.apiKey) {
    console.log('[testing] ⚠ Google API key not found, skipping Places API test');
    return false;
  }

  try {
    const query = TEST_CONFIG.testQueries[0];
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${TEST_CONFIG.apiKey}`;
    
    console.log(`[testing] Testing Places API with query: "${query}"`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      console.log(`[testing] ✓ Places API working - found ${data.results.length} results`);
      console.log(`[testing]   Sample result: ${data.results[0].name} - ${data.results[0].formatted_address}`);
      return true;
    } else {
      console.log(`[testing] ✗ Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error('[testing] ✗ Places API test failed:', error.message);
    return false;
  }
}

/**
 * Test Google Translate API
 */
async function testGoogleTranslate() {
  console.log('\n[testing] === Testing Google Translate API ===');
  
  if (!TEST_CONFIG.apiKey) {
    console.log('[testing] ⚠ Google API key not found, skipping Translate API test');
    return false;
  }

  try {
    const testCase = TEST_CONFIG.testTranslations[0];
    const url = `https://translation.googleapis.com/language/translate/v2?key=${TEST_CONFIG.apiKey}`;
    
    console.log(`[testing] Testing Translate API: "${testCase.text}" (${testCase.from} → ${testCase.to})`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: testCase.text,
        source: testCase.from,
        target: testCase.to,
        format: 'text'
      })
    });
    
    const data = await response.json();
    
    if (data.data && data.data.translations && data.data.translations.length > 0) {
      const translation = data.data.translations[0];
      console.log(`[testing] ✓ Translate API working - result: "${translation.translatedText}"`);
      if (translation.detectedSourceLanguage) {
        console.log(`[testing]   Detected source language: ${translation.detectedSourceLanguage}`);
      }
      return true;
    } else {
      console.log(`[testing] ✗ Translate API error:`, data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('[testing] ✗ Translate API test failed:', error.message);
    return false;
  }
}

/**
 * Test Google Maps JavaScript API loading
 */
async function testGoogleMapsScript() {
  console.log('\n[testing] === Testing Google Maps JavaScript API ===');
  
  if (!TEST_CONFIG.apiKey) {
    console.log('[testing] ⚠ Google API key not found, skipping Maps JavaScript API test');
    return false;
  }

  try {
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${TEST_CONFIG.apiKey}&libraries=places`;
    
    console.log('[testing] Testing Maps JavaScript API URL accessibility...');
    
    const response = await fetch(scriptUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log('[testing] ✓ Maps JavaScript API URL is accessible');
      return true;
    } else {
      console.log(`[testing] ✗ Maps JavaScript API URL returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('[testing] ✗ Maps JavaScript API test failed:', error.message);
    return false;
  }
}

/**
 * Test API key permissions
 */
async function testAPIKeyPermissions() {
  console.log('\n[testing] === Testing API Key Permissions ===');
  
  if (!TEST_CONFIG.apiKey) {
    console.log('[testing] ✗ No API key provided');
    return false;
  }

  console.log('[testing] API Key Status: Configured');
  console.log(`[testing] API Key Length: ${TEST_CONFIG.apiKey.length} characters`);
  console.log(`[testing] API Key Preview: ${TEST_CONFIG.apiKey.substring(0, 10)}...`);
  
  return true;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('[testing] Google API Integration Test Suite');
  console.log('[testing] =====================================');
  
  const results = {
    apiKey: await testAPIKeyPermissions(),
    places: await testGooglePlaces(),
    translate: await testGoogleTranslate(),
    mapsScript: await testGoogleMapsScript()
  };
  
  console.log('\n[testing] === Test Results Summary ===');
  console.log(`[testing] API Key: ${results.apiKey ? '✓ Pass' : '✗ Fail'}`);
  console.log(`[testing] Places API: ${results.places ? '✓ Pass' : '✗ Fail'}`);
  console.log(`[testing] Translate API: ${results.translate ? '✓ Pass' : '✗ Fail'}`);
  console.log(`[testing] Maps Script: ${results.mapsScript ? '✓ Pass' : '✗ Fail'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  console.log(`\n[testing] Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (passedTests === totalTests) {
    console.log('[testing] 🎉 All tests passed! Google API integration is working correctly.');
  } else if (passedTests > 0) {
    console.log('[testing] ⚠ Some tests passed. Check API key permissions and enabled services.');
  } else {
    console.log('[testing] ❌ All tests failed. Please check your Google API key and configuration.');
  }
  
  return {
    totalTests,
    passedTests,
    successRate: parseFloat(successRate),
    results
  };
}

// Run tests
runAllTests()
  .then(report => {
    process.exit(report.passedTests === report.totalTests ? 0 : 1);
  })
  .catch(error => {
    console.error('[testing] Test execution failed:', error);
    process.exit(1);
  });
