#!/usr/bin/env node

/**
 * Test Billing Submission
 * Tests the complete billing workflow with file uploads
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Mock user data - you'll need a valid auth token
const WORKER_TOKEN = 'your-worker-token-here';  // Replace with actual token
const COMPLAINT_ID = 1;  // Replace with actual complaint ID

async function testBillingSubmission() {
  console.log('🧪 TESTING BILLING SUBMISSION');
  console.log('==============================\n');

  try {
    // Create test files
    const testDir = path.join(__dirname, 'test_uploads');
    const billImagePath = path.join(testDir, 'test_bill.jpg');
    const qrImagePath = path.join(testDir, 'test_qr.png');

    if (!fs.existsSync(billImagePath) || !fs.existsSync(qrImagePath)) {
      console.error('❌ Test files not found. Run test_file_upload.bat first');
      return;
    }

    // Test 1: Manual Payment (Cash)
    console.log('📝 TEST 1: Manual Payment (Cash)');
    console.log('-------------------------------');

    const form1 = new FormData();
    form1.append('complaint_id', COMPLAINT_ID);
    form1.append('labor_charge', 500);
    form1.append('material_cost', 200);
    form1.append('payment_mode', 'Manual');
    form1.append('bill_image', fs.createReadStream(billImagePath));

    try {
      const response1 = await axios.post(`${API_URL}/work/complete`, form1, {
        headers: {
          ...form1.getHeaders(),
          'Authorization': `Bearer ${WORKER_TOKEN}`
        }
      });

      if (response1.status === 201 || response1.status === 200) {
        console.log('✅ Manual payment submission successful');
        console.log('   Response:', response1.data);
      }
    } catch (error) {
      console.error('❌ Manual payment submission failed');
      console.error('   Error:', error.response?.data || error.message);
    }

    console.log('');

    // Test 2: Digital Payment (QR)
    console.log('📝 TEST 2: Digital Payment (QR/UPI)');
    console.log('------------------------------------');

    const form2 = new FormData();
    form2.append('complaint_id', COMPLAINT_ID);
    form2.append('labor_charge', 750);
    form2.append('material_cost', 250);
    form2.append('payment_mode', 'Digital');
    form2.append('upi_id', 'worker@upi');
    form2.append('qr_image', fs.createReadStream(qrImagePath));

    try {
      const response2 = await axios.post(`${API_URL}/work/complete`, form2, {
        headers: {
          ...form2.getHeaders(),
          'Authorization': `Bearer ${WORKER_TOKEN}`
        }
      });

      if (response2.status === 201 || response2.status === 200) {
        console.log('✅ Digital payment submission successful');
        console.log('   Response:', response2.data);
      }
    } catch (error) {
      console.error('❌ Digital payment submission failed');
      console.error('   Error:', error.response?.data || error.message);
    }

    console.log('');

    // Test 3: Check file upload directory
    console.log('📁 Checking Upload Directory');
    console.log('---------------------------');

    const uploadDir = path.join(__dirname, 'backend/uploads/work_payments');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      console.log(`✅ Upload directory exists: ${uploadDir}`);
      console.log(`   Files uploaded: ${files.length}`);
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('❌ Upload directory not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n✨ Tests completed\n');
}

testBillingSubmission();
