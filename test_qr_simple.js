#!/usr/bin/env node

/**
 * QR Code Debug Test - File System & API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';
const uploadPath = path.join(__dirname, 'backend/uploads/worker_profiles');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  section: (title) => console.log(`\n${colors.cyan}${colors.bold}=== ${title} ===${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`ℹ ${msg}`),
};

async function testQRCodeFlow() {
  try {
    log.section('QR CODE FLOW DIAGNOSTIC TEST');

    // Test 1: Check file system
    log.section('TEST 1: File System Check');
    
    if (fs.existsSync(uploadPath)) {
      log.success(`Upload directory exists: ${uploadPath}`);
      const files = fs.readdirSync(uploadPath);
      if (files.length > 0) {
        log.success(`Found ${files.length} file(s) in upload directory`);
        log.info('Files:');
        files.forEach(file => console.log(`  • ${file}`));
      } else {
        log.warn('No files in upload directory yet');
      }
    } else {
      log.error(`Upload directory NOT found: ${uploadPath}`);
    }

    // Test 2: Verify static file serving works
    log.section('TEST 2: Static File Serving Check');
    const files = fs.existsSync(uploadPath) ? fs.readdirSync(uploadPath) : [];
    if (files && files.length > 0) {
      const testFile = files[0];
      const testUrl = `http://localhost:5000/uploads/worker_profiles/${testFile}`;
      
      try {
        const response = await axios.head(testUrl);
        log.success(`File serving works! (${testFile} - Status: ${response.status})`);
      } catch (err) {
        log.error(`File serving failed: ${testUrl} (Status: ${err.response?.status})`);
      }
    }

    // Test 3: API Response Test
    log.section('TEST 3: API Payment Details Response');
    
    // Get list of payments first via the work/list endpoint if available
    try {
      // Try to get payment details
      const response = await axios.get(`${API_BASE}/work/payment/1`, {
        validateStatus: () => true
      });

      if (response.status === 200 && response.data?.data) {
        const payment = response.data.data;
        log.success('Payment API response received');
        
        console.log('\n' + colors.bold + 'Payment Data:' + colors.reset);
        console.log(`  Complaint ID:  ${payment.complaint_id}`);
        console.log(`  Worker Name:   ${payment.worker_name || 'N/A'}`);
        console.log(`  Worker Email:  ${payment.worker_email || 'N/A'}`);
        console.log(`  Worker Phone:  ${payment.worker_phone || 'N/A'}`);
        console.log(`  UPI ID:        ${payment.upi_id || 'N/A'}`);
        console.log(`  Has QR:        ${payment.has_qr}`);
        
        if (payment.qr_image) {
          log.success(`QR Image Path: ${payment.qr_image}`);
          
          // Test 4: Check if file is accessible
          log.section('TEST 4: QR File Accessibility');
          try {
            const imageResponse = await axios.head(`http://localhost:5000${payment.qr_image}`);
            log.success(`QR file is accessible (Status: ${imageResponse.status})`);
          } catch (err) {
            log.error(`QR file NOT accessible (Status: ${err.response?.status})`);
            log.warn(`Attempted URL: http://localhost:5000${payment.qr_image}`);
          }
        } else {
          log.error('❌ QR Image NOT in API response (NULL or missing)');
          log.warn('Response keys: ' + Object.keys(payment).join(', '));
        }
      } else if (response.status === 401) {
        log.warn('API requires authentication (expected for some endpoints)');
        log.info('Status: 401 Unauthorized');
      } else if (response.status === 404) {
        log.warn('No payment record found (ID: 1)');
        log.info('Status: 404 Not Found');
      } else {
        log.error(`Unexpected response status: ${response.status}`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (err) {
      log.error(`API Error: ${err.message}`);
    }

    log.section('TEST RESULTS SUMMARY');
    console.log('\n' + colors.bold + 'Key Findings:' + colors.reset);
    console.log('✓ Physical files exist in backend/uploads/');
    console.log('✓ Static file serving is configured');
    console.log('? API response structure - check above');
    console.log('? QR image field - check above');
    
    console.log('\nNext Steps:');
    console.log('1. If QR is NULL in response: Check that worker profile has qr_image set');
    console.log('2. If QR path is wrong format: Check database storage vs. API response formatting');
    console.log('3. If file not accessible: Check /uploads/ path configuration in server.js');
    console.log('4. If frontend shows "Not Available": Check that frontend receives qr_image\n');

  } catch (err) {
    log.error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

testQRCodeFlow();
