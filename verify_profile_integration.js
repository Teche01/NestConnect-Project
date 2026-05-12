#!/usr/bin/env node

/**
 * Profile Feature Verification Script
 * Tests:
 * 1. Backend connectivity
 * 2. Database availability  
 * 3. API route registration
 * 4. Profile endpoints functionality
 */

const http = require('http');

const config = {
  backend: { host: 'localhost', port: 5000 },
  testUser: {
    email: 'resident@example.com',
    password: 'resident123'
  }
};

let authToken = null;

/**
 * Make HTTP request helper
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

/**
 * Test utilities
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '═'.repeat(50));
  log(title, 'cyan');
  console.log('═'.repeat(50));
}

/**
 * Test 1: Backend Connectivity
 */
async function testBackendConnectivity() {
  header('TEST 1: Backend Connectivity');
  
  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await makeRequest({
      ...options,
      body: { email: 'test@test.com', password: 'test' }
    });

    if (response.statusCode >= 200 && response.statusCode < 600) {
      log('✅ Backend is accessible on port 5000', 'green');
      return true;
    } else {
      log('❌ Backend not responding correctly', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Cannot connect to backend: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 2: Authentication
 */
async function testAuthentication() {
  header('TEST 2: User Authentication');
  
  try {
    const response = await makeRequest({
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: config.testUser.email,
        password: config.testUser.password
      }
    });

    if (response.statusCode === 200 && response.data.token) {
      authToken = response.data.token;
      log(`✅ Authentication successful`, 'green');
      log(`   Token: ${authToken.substring(0, 30)}...`, 'blue');
      log(`   Role: ${response.data.role}`, 'blue');
      log(`   Name: ${response.data.name}`, 'blue');
      return true;
    } else if (response.statusCode === 401) {
      log('❌ Invalid credentials', 'red');
      log('   Make sure test user exists: ' + config.testUser.email, 'yellow');
      return false;
    } else {
      log(`❌ Authentication failed (${response.statusCode})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Authentication error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 3: GET Profile Endpoint
 */
async function testGetProfile() {
  header('TEST 3: GET /api/auth/profile');
  
  if (!authToken) {
    log('⚠️  Skipping - No auth token available', 'yellow');
    return false;
  }

  try {
    const response = await makeRequest({
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200 && response.data.id) {
      log('✅ Profile endpoint working', 'green');
      log(`   ID: ${response.data.id}`, 'blue');
      log(`   Name: ${response.data.name}`, 'blue');
      log(`   Email: ${response.data.email}`, 'blue');
      log(`   Role: ${response.data.role}`, 'blue');
      log(`   Phone: ${response.data.phone || 'Not set'}`, 'blue');
      log(`   Flat: ${response.data.flat_number || 'Not set'}`, 'blue');
      return true;
    } else if (response.statusCode === 401) {
      log('❌ Unauthorized - Token may be invalid', 'red');
      return false;
    } else {
      log(`❌ GET Profile failed (${response.statusCode})`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ GET Profile error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 4: PUT Update Profile Endpoint
 */
async function testUpdateProfile() {
  header('TEST 4: PUT /api/auth/update-profile');
  
  if (!authToken) {
    log('⚠️  Skipping - No auth token available', 'yellow');
    return false;
  }

  try {
    const updateData = {
      name: 'Test User Updated',
      phone: '9876543210',
      flat_number: '999'
    };

    const response = await makeRequest({
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/update-profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: updateData
    });

    if (response.statusCode === 200 && response.data.message) {
      log('✅ Profile update successful', 'green');
      log(`   Message: ${response.data.message}`, 'blue');
      if (response.data.user) {
        log(`   Updated Name: ${response.data.user.name}`, 'blue');
      }
      return true;
    } else if (response.statusCode === 401) {
      log('❌ Unauthorized - Token may be invalid', 'red');
      return false;
    } else {
      log(`❌ PUT Profile update failed (${response.statusCode})`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ PUT Profile error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 5: Verify Profile Update Persisted
 */
async function testVerifyPersistence() {
  header('TEST 5: Verify Update Persistence');
  
  if (!authToken) {
    log('⚠️  Skipping - No auth token available', 'yellow');
    return false;
  }

  try {
    const response = await makeRequest({
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.statusCode === 200) {
      const nameMatches = response.data.name === 'Test User Updated';
      const phoneMatches = response.data.phone === '9876543210';
      const flatMatches = response.data.flat_number === '999';

      log('✅ Persistence verification completed', 'green');
      log(`   Name updated in DB: ${nameMatches ? '✅' : '❌'}`, 'blue');
      log(`   Phone updated in DB: ${phoneMatches ? '✅' : '❌'}`, 'blue');
      log(`   Flat updated in DB: ${flatMatches ? '✅' : '❌'}`, 'blue');

      return nameMatches && phoneMatches && flatMatches;
    } else {
      log(`❌ Verification GET failed (${response.statusCode})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Verification error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 6: Frontend Files Check
 */
async function testFrontendFiles() {
  header('TEST 6: Frontend Files Check');
  
  const fs = require('fs');
  const path = require('path');
  
  const files = [
    'frontend/src/components/ProfileDropdown.jsx',
    'frontend/src/pages/Profile.jsx',
    'frontend/src/pages/EditProfile.jsx',
    'frontend/src/styles/ProfileDropdown.css',
    'frontend/src/styles/ProfilePage.css',
    'frontend/src/styles/EditProfile.css'
  ];

  let allExist = true;
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} - NOT FOUND`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.clear();
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║  PROFILE FEATURE - COMPLETE VERIFICATION      ║', 'cyan');
  log('║  Smart Residential Governance System          ║', 'cyan');
  log('╚════════════════════════════════════════════════╝\n', 'cyan');

  const results = {};

  // Run tests in sequence
  results.connectivity = await testBackendConnectivity();
  if (!results.connectivity) {
    log('\n❌ Backend not accessible - cannot continue tests', 'red');
    return;
  }

  results.auth = await testAuthentication();
  if (!results.auth) {
    log('\n⚠️  Authentication failed - skipping profile tests', 'yellow');
    results.getProfile = false;
    results.update = false;
    results.verify = false;
  } else {
    results.getProfile = await testGetProfile();
    results.update = await testUpdateProfile();
    results.verify = await testVerifyPersistence();
  }

  results.files = await testFrontendFiles();

  // Print summary
  header('TEST SUMMARY');
  
  console.log('Backend Connectivity:     ' + (results.connectivity ? '✅ PASS' : '❌ FAIL'));
  console.log('Authentication:           ' + (results.auth ? '✅ PASS' : '❌ FAIL'));
  console.log('GET /api/auth/profile:    ' + (results.getProfile ? '✅ PASS' : '⚠️  SKIP'));
  console.log('PUT /api/auth/update-profile: ' + (results.update ? '✅ PASS' : '⚠️  SKIP'));
  console.log('Update Persistence:       ' + (results.verify ? '✅ PASS' : '⚠️  SKIP'));
  console.log('Frontend Files:           ' + (results.files ? '✅ PASS' : '❌ FAIL'));

  console.log('\n' + '═'.repeat(50));
  const allPassed = results.connectivity && results.auth && results.getProfile && 
                   results.update && results.verify && results.files;
  
  if (allPassed) {
    log('🎉 ALL TESTS PASSED - SYSTEM READY!', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - CHECK OUTPUT ABOVE', 'yellow');
  }
  console.log('═'.repeat(50) + '\n');
}

// Run the verification
runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
