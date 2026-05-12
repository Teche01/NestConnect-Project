#!/usr/bin/env node

/**
 * QR Code Debug Test - Complete Diagnostic
 * Tests: Database → API → File System → Frontend
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// Color codes for terminal output
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
    const uploadPath = path.join(__dirname, 'backend/uploads/worker_profiles');
    
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

    // Test 2: Check database directly (via query)
    log.section('TEST 2: Database Query Test');
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'smart_residential'
    });

    try {
      // Get workers with QR codes
      const [workers] = await connection.execute(
        'SELECT id, user_id, upi_id, qr_image FROM workers WHERE qr_image IS NOT NULL AND qr_image != "" LIMIT 5'
      );

      if (workers.length > 0) {
        log.success(`Found ${workers.length} worker(s) with QR codes in database`);
        workers.forEach(w => {
          console.log(`  • Worker ID: ${w.id}, User ID: ${w.user_id}, QR: ${w.qr_image}`);
        });
      } else {
        log.warn('No workers with QR codes found in database');
      }

      // Get work_payments with QR
      const [payments] = await connection.execute(
        'SELECT wp.id, wp.complaint_id, wp.worker_id, wp.qr_image, wp.upi_id, c.status FROM work_payments wp LEFT JOIN complaints c ON wp.complaint_id = c.id LIMIT 5'
      );

      if (payments.length > 0) {
        log.success(`Found ${payments.length} payment record(s)`);
        payments.forEach(p => {
          console.log(`  • Payment ID: ${p.id}, Worker ID: ${p.worker_id}, QR: ${p.qr_image || 'NULL'}, UPI: ${p.upi_id || 'NULL'}`);
        });
      } else {
        log.warn('No payment records found');
      }
    } finally {
      await connection.end();
    }

    // Test 3: API Response Test
    log.section('TEST 3: API Response Test');
    
    try {
      // Try to get a payment (assuming ID 1)
      const response = await axios.get(`${API_BASE}/work/payment/1`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Try without auth
          return axios.get(`${API_BASE}/work/payment/1`);
        }
        throw err;
      });

      if (response.data?.data) {
        const payment = response.data.data;
        log.success('Payment API response received');
        
        if (payment.qr_image) {
          log.success(`QR Image in response: ${payment.qr_image}`);
          
          // Test 4: Check if file is accessible
          log.section('TEST 4: File Accessibility Check');
          try {
            const imageResponse = await axios.head(`http://localhost:5000${payment.qr_image}`);
            log.success(`QR Image file is accessible (Status: ${imageResponse.status})`);
          } catch (err) {
            log.error(`QR Image file NOT accessible (Status: ${err.response?.status})`);
          }
        } else {
          log.error('QR Image NOT in API response');
          log.warn('Response fields: ' + Object.keys(payment).join(', '));
        }

        // Show other relevant fields
        console.log('\nPayment Details:');
        console.log(`  Worker Name: ${payment.worker_name}`);
        console.log(`  Worker Email: ${payment.worker_email}`);
        console.log(`  Worker Phone: ${payment.worker_phone}`);
        console.log(`  UPI ID: ${payment.upi_id}`);
        console.log(`  Payment Status: ${payment.payment_status}`);
        console.log(`  Has QR: ${payment.has_qr}`);
      } else {
        log.error('No data in API response: ' + JSON.stringify(response.data));
      }
    } catch (err) {
      if (err.response?.status === 404) {
        log.warn('Payment record not found (expected if no test data)');
      } else {
        log.error(`API Error: ${err.message}`);
      }
    }

    log.section('DIAGNOSTIC COMPLETE');
    console.log('\n' + colors.bold + 'Interpretation Guide:' + colors.reset);
    console.log('1. If TEST 1 passes but TEST 2 fails: Upload issue, check worker wasn\'t created');
    console.log('2. If TEST 2 passes but TEST 3 shows NULL QR: Query bug, verify fixed WHERE clause');
    console.log('3. If TEST 3 passes but TEST 4 fails: File not found, check storage path mismatch');
    console.log('4. All pass but frontend doesn\'t show: Frontend display logic issue\n');

  } catch (err) {
    log.error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

testQRCodeFlow();
