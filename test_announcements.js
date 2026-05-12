/**
 * Test script for Announcement & Notification APIs
 * Run: node test_announcements.js
 */

const http = require('http');

const API_URL = 'http://localhost:5000/api';
let TOKEN = '';

// Mock token (you need to login and get real token first)
const ADMIN_TOKEN = 'your-admin-jwt-token';
const USER_TOKEN = 'your-user-jwt-token';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testGetAnnouncements() {
  console.log('\n📋 TEST 1: Get All Announcements (Public)');
  try {
    const result = await makeRequest('GET', '/announcements');
    console.log(`Status: ${result.status}`);
    console.log(`Announcements: ${result.body.data?.length || 0}`);
    if (result.body.data?.length > 0) {
      console.log(`Sample:`, result.body.data[0]);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testCreateAnnouncement() {
  console.log('\n✨ TEST 2: Create Announcement (Admin Only)');
  const announcement = {
    title: 'Test Maintenance Notice',
    message: 'Water tank maintenance will be performed on Sunday from 9 AM to 12 PM. Please ensure water tanks are closed.',
    priority: 'Important'
  };

  try {
    const result = await makeRequest('POST', '/announcements', announcement, ADMIN_TOKEN);
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.body);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testGetNotifications() {
  console.log('\n🔔 TEST 3: Get User Notifications');
  try {
    const result = await makeRequest('GET', '/notifications', null, USER_TOKEN);
    console.log(`Status: ${result.status}`);
    console.log(`Notifications: ${result.body.data?.length || 0}`);
    if (result.body.data?.length > 0) {
      console.log(`Sample:`, result.body.data[0]);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testGetUnreadCount() {
  console.log('\n📊 TEST 4: Get Unread Count');
  try {
    const result = await makeRequest('GET', '/notifications/unread/count', null, USER_TOKEN);
    console.log(`Status: ${result.status}`);
    console.log(`Unread Count:`, result.body.unread_count);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testGetLatestUnread() {
  console.log('\n⭐ TEST 5: Get Latest 5 Unread');
  try {
    const result = await makeRequest('GET', '/notifications/unread/latest', null, USER_TOKEN);
    console.log(`Status: ${result.status}`);
    console.log(`Latest Unread: ${result.body.data?.length || 0}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testMarkAsRead() {
  console.log('\n✅ TEST 6: Mark Notification as Read');
  const notificationId = 1; // Replace with actual ID
  try {
    const result = await makeRequest('PUT', `/notifications/${notificationId}/read`, {}, USER_TOKEN);
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.body);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testMarkAllAsRead() {
  console.log('\n✅ TEST 7: Mark All as Read');
  try {
    const result = await makeRequest('PUT', '/notifications/read-all', {}, USER_TOKEN);
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.body);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('====================================');
  console.log('🧪 ANNOUNCEMENT API TESTS');
  console.log('====================================');
  console.log('\n⚠️  IMPORTANT: Replace ADMIN_TOKEN and USER_TOKEN with actual JWT tokens');
  console.log('   Login and get token from /api/auth/login first\n');

  if (!ADMIN_TOKEN || ADMIN_TOKEN === 'your-admin-jwt-token') {
    console.log('❌ Please set ADMIN_TOKEN with a real token first!');
    console.log('   Update line 14 in this file\n');
  }

  if (!USER_TOKEN || USER_TOKEN === 'your-user-jwt-token') {
    console.log('❌ Please set USER_TOKEN with a real token first!');
    console.log('   Update line 15 in this file\n');
  }

  // Test 1: Get all announcements (public)
  await testGetAnnouncements();

  // Test 2: Create announcement (admin only)
  if (ADMIN_TOKEN !== 'your-admin-jwt-token') {
    await testCreateAnnouncement();
  }

  // Test 3-7: Notification tests (user only)
  if (USER_TOKEN !== 'your-user-jwt-token') {
    await testGetNotifications();
    await testGetUnreadCount();
    await testGetLatestUnread();
    // await testMarkAsRead(); // Uncomment to test with actual ID
    // await testMarkAllAsRead(); // Uncomment to test
  }

  console.log('\n====================================');
  console.log('✅ TEST SUITE COMPLETE');
  console.log('====================================\n');
}

// Run tests
runTests().catch(console.error);
