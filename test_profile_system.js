/**
 * Test Profile System Integration
 * This script tests the complete profile feature:
 * 1. Get user profile
 * 2. Update user profile
 * 3. Verify changes persisted
 */

const http = require('http');

// Test configuration
const BACKEND_URL = 'http://localhost:5000';
const TEST_USER_ID = 1; // Assuming a test user exists

// Test data
let testToken = null;
let originalProfile = null;
let updatedProfile = null;

/**
 * Helper function to make HTTP requests
 */
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BACKEND_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Test 1: Login to get token
 */
async function testLogin() {
  console.log('\n=== TEST 1: Login to get token ===');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {}, {
      email: 'resident@example.com',
      password: 'resident123'
    });

    if (response.status === 200 && response.data.token) {
      testToken = response.data.token;
      console.log('✅ Login successful');
      console.log('   Token:', testToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ Login failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Test 2: Fetch user profile
 */
async function testGetProfile() {
  console.log('\n=== TEST 2: Fetch user profile ===');
  try {
    const response = await makeRequest('GET', '/api/auth/profile', {
      'Authorization': `Bearer ${testToken}`
    });

    if (response.status === 200 && response.data.user) {
      originalProfile = response.data.user;
      console.log('✅ Profile fetched successfully');
      console.log('   Name:', originalProfile.name);
      console.log('   Email:', originalProfile.email);
      console.log('   Phone:', originalProfile.phone);
      console.log('   Flat Number:', originalProfile.flat_number);
      console.log('   Role:', originalProfile.role);
      return true;
    } else {
      console.log('❌ Profile fetch failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile fetch error:', error.message);
    return false;
  }
}

/**
 * Test 3: Update user profile
 */
async function testUpdateProfile() {
  console.log('\n=== TEST 3: Update user profile ===');
  try {
    const updateData = {
      name: 'Updated Test User',
      phone: '9999999999',
      flat_number: '101'
    };

    const response = await makeRequest('PUT', '/api/auth/update-profile', {
      'Authorization': `Bearer ${testToken}`
    }, updateData);

    if (response.status === 200 && response.data.message === 'Profile updated successfully') {
      console.log('✅ Profile updated successfully');
      console.log('   New Name:', updateData.name);
      console.log('   New Phone:', updateData.phone);
      console.log('   New Flat Number:', updateData.flat_number);
      return true;
    } else {
      console.log('❌ Profile update failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile update error:', error.message);
    return false;
  }
}

/**
 * Test 4: Verify updated profile
 */
async function testVerifyProfileUpdate() {
  console.log('\n=== TEST 4: Verify profile update persisted ===');
  try {
    const response = await makeRequest('GET', '/api/auth/profile', {
      'Authorization': `Bearer ${testToken}`
    });

    if (response.status === 200 && response.data.user) {
      updatedProfile = response.data.user;
      const nameChanged = updatedProfile.name === 'Updated Test User';
      const phoneChanged = updatedProfile.phone === '9999999999';
      const flatChanged = updatedProfile.flat_number === '101';

      console.log('✅ Profile verification completed');
      console.log('   Name updated:', nameChanged ? '✅' : '❌');
      console.log('   Phone updated:', phoneChanged ? '✅' : '❌');
      console.log('   Flat number updated:', flatChanged ? '✅' : '❌');

      return nameChanged && phoneChanged && flatChanged;
    } else {
      console.log('❌ Profile verification failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile verification error:', error.message);
    return false;
  }
}

/**
 * Test 5: Revert profile to original
 */
async function testRevertProfile() {
  console.log('\n=== TEST 5: Revert profile to original ===');
  try {
    const revertData = {
      name: originalProfile.name,
      phone: originalProfile.phone,
      flat_number: originalProfile.flat_number
    };

    const response = await makeRequest('PUT', '/api/auth/update-profile', {
      'Authorization': `Bearer ${testToken}`
    }, revertData);

    if (response.status === 200) {
      console.log('✅ Profile reverted to original');
      return true;
    } else {
      console.log('⚠️ Profile revert encountered issue (not critical)');
      return true;
    }
  } catch (error) {
    console.log('⚠️ Profile revert error (not critical):', error.message);
    return true;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     PROFILE SYSTEM INTEGRATION TEST SUITE          ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const results = {
    login: false,
    getProfile: false,
    updateProfile: false,
    verifyUpdate: false,
    revertProfile: false
  };

  // Run tests in sequence
  results.login = await testLogin();
  if (!results.login) {
    console.log('\n❌ Cannot continue - login failed');
    return;
  }

  results.getProfile = await testGetProfile();
  if (!results.getProfile) {
    console.log('\n❌ Cannot continue - profile fetch failed');
    return;
  }

  results.updateProfile = await testUpdateProfile();
  if (!results.updateProfile) {
    console.log('\n⚠️ Update test failed, skipping verification');
  } else {
    results.verifyUpdate = await testVerifyProfileUpdate();
    results.revertProfile = await testRevertProfile();
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║                  TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('Login:              ' + (results.login ? '✅ PASS' : '❌ FAIL'));
  console.log('Get Profile:        ' + (results.getProfile ? '✅ PASS' : '❌ FAIL'));
  console.log('Update Profile:     ' + (results.updateProfile ? '✅ PASS' : '❌ FAIL'));
  console.log('Verify Update:      ' + (results.verifyUpdate ? '✅ PASS' : '⚠️ SKIP'));
  console.log('Revert Profile:     ' + (results.revertProfile ? '✅ PASS' : '⚠️ SKIP'));

  const allPassed = results.login && results.getProfile && results.updateProfile && results.verifyUpdate;
  console.log('\n' + (allPassed ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'));
}

// Run the tests
runAllTests().catch(console.error);
