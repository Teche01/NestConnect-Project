#!/usr/bin/env node

/**
 * ACTUAL SYSTEM TEST - Check real issues
 * 1. Worker assignment/workload balancing 
 * 2. QR code display
 */

const axios = require('axios');
const pool = require('./backend/config/db');

const API = 'http://localhost:5001/api';

async function testSystem() {
  console.log('\n=== ACTUAL SYSTEM VERIFICATION ===\n');
  

  try {
    // TEST 1: Check worker assignments
    console.log('TEST 1: Worker Assignments & Workload');
    console.log('=====================================');
    
    const [workers] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(a.id) as active_assignments,
        COUNT(c.id) as completed_count
      FROM users u
      LEFT JOIN assignments a ON u.id = a.worker_id AND a.status = 'ACTIVE'
      LEFT JOIN complaints c ON a.complaint_id = c.id AND c.status = 'COMPLETED'
      WHERE u.role = 'WORKER'
      GROUP BY u.id
      ORDER BY u.id
    `);

    console.log('Worker Workload:');
    workers.forEach(w => {
      console.log(`  ${w.name} (ID: ${w.id}): ${w.active_assignments} assignments, ${w.completed_count} completed`);
    });

    // Check recent complaints
    const [complaints] = await pool.query(`
      SELECT c.id, c.title, c.status, a.worker_id, u.name 
      FROM complaints c
      LEFT JOIN assignments a ON c.id = a.complaint_id AND a.status = 'ACTIVE'
      LEFT JOIN users u ON a.worker_id = u.id
      ORDER BY c.id DESC
      LIMIT 5
    `);

    console.log('\nRecent Complaints:');
    complaints.forEach(c => {
      const assigned = c.worker_id ? `✓ ${c.name} (ID: ${c.worker_id})` : '✗ NOT ASSIGNED';
      console.log(`  ${c.id}. ${c.title} [${c.status}] - ${assigned}`);
    });

    // TEST 2: Check QR codes
    console.log('\n\nTEST 2: QR Code Storage');
    console.log('=======================');

    const [workers_qr] = await pool.query(`
      SELECT id, user_id, upi_id, qr_image 
      FROM workers 
      WHERE qr_image IS NOT NULL AND qr_image != ''
      LIMIT 5
    `);

    if (workers_qr.length > 0) {
      console.log('Workers with QR codes:');
      workers_qr.forEach(w => {
        console.log(`  Worker ID ${w.id} (User ${w.user_id}): ${w.qr_image}`);
      });
    } else {
      console.log('❌ NO workers have QR codes in database!');
    }

    // Check payments with QR
    const [payments] = await pool.query(`
      SELECT wp.id, wp.complaint_id, wp.worker_id, wp.payment_status, 
             wp.qr_image as wp_qr, w.qr_image as profile_qr
      FROM work_payments wp
      LEFT JOIN workers w ON wp.worker_id = w.user_id
      ORDER BY wp.id DESC
      LIMIT 5
    `);

    console.log('\nPayment Records:');
    payments.forEach(p => {
      const wp_qr = p.wp_qr ? '✓' : '✗';
      const profile_qr = p.profile_qr ? '✓' : '✗';
      console.log(`  Payment ${p.id}: Status=${p.payment_status}, Work QR=${wp_qr}, Profile QR=${profile_qr}`);
    });

    // TEST 3: Try API call
    console.log('\n\nTEST 3: API Response Check');
    console.log('===========================');

    try {
      const response = await axios.get(`${API}/work/payment/1`, {
        validateStatus: () => true
      });
      
      if (response.status === 200 && response.data?.data) {
        const payment = response.data.data;
        console.log('Payment API Response:');
        console.log(`  Status: ${response.status} ✓`);
        console.log(`  QR Image in response: ${payment.qr_image ? '✓ ' + payment.qr_image : '✗ NULL'}`);
        console.log(`  Has QR: ${payment.has_qr}`);
        console.log(`  Worker: ${payment.worker_name}`);
      } else {
        console.log(`API Response Status: ${response.status}`);
      }
    } catch (e) {
      console.log(`API Error: ${e.message}`);
    }

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit(0);
  }
}

testSystem();
