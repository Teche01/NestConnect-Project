#!/usr/bin/env node

const db = require('./backend/config/db');

async function diagnose() {
  try {
    console.log('\n=== ACTUAL SYSTEM DIAGNOSIS ===\n');

    // Check 1: Worker setup
    console.log('1. WORKERS IN DATABASE:');
    const [workers] = await db.query(`
      SELECT u.id, u.name, u.email, w.category, w.is_available, w.current_tasks 
      FROM users u
      LEFT JOIN workers w ON u.id = w.user_id
      WHERE u.role = 'WORKER'
      ORDER BY u.id
    `);

    if (workers.length === 0) {
      console.log('   ❌ NO WORKERS FOUND!');
    } else {
      workers.forEach(w => {
        const available = w.is_available ? '✓' : '✗';
        console.log(`   ${w.id}. ${w.name.padEnd(20)} | Cat: ${(w.category || 'NULL').padEnd(12)} | Available: ${available} | Tasks: ${w.current_tasks}`);
      });
    }

    // Check 2: Recent complaints
    console.log('\n2. RECENT COMPLAINTS:');
    const [complaints] = await db.query(`
      SELECT c.id, c.title, c.ai_category, c.status, c.worker_id, u.name as worker_name
      FROM complaints c
      LEFT JOIN users u ON c.worker_id = u.id
      ORDER BY c.id DESC
      LIMIT 10
    `);

    if (complaints.length === 0) {
      console.log('   ❌ NO COMPLAINTS FOUND!');
    } else {
      complaints.forEach(c => {
        const assigned = c.worker_id ? `✓ ${c.worker_name}` : '✗ UNASSIGNED';
        console.log(`   ${c.id}. [${c.status.padEnd(18)}] ${c.title.padEnd(30)} | Category: ${(c.ai_category || 'NULL').padEnd(12)} | Worker: ${assigned}`);
      });
    }

    // Check 3: QR codes
    console.log('\n3. QR CODES:');
    const [workersWithQR] = await db.query(`
      SELECT u.id, u.name, w.qr_image 
      FROM users u
      LEFT JOIN workers w ON u.id = w.user_id
      WHERE w.qr_image IS NOT NULL AND w.qr_image != ''
    `);

    if (workersWithQR.length === 0) {
      console.log('   ❌ NO WORKERS HAVE QR CODES UPLOADED!');
    } else {
      workersWithQR.forEach(w => {
        console.log(`   ${w.id}. ${w.name}: ${w.qr_image}`);
      });
    }

    // Check 4: Payments
    console.log('\n4. PAYMENTS/QR IN WORK_PAYMENTS:');
    const [payments] = await db.query(`
      SELECT wp.id, wp.complaint_id, wp.worker_id, wp.payment_status, wp.qr_image, w.qr_image as profile_qr
      FROM work_payments wp
      LEFT JOIN workers w ON wp.worker_id = w.user_id
      ORDER BY wp.id DESC
      LIMIT 5
    `);

    if (payments.length === 0) {
      console.log('   ❌ NO PAYMENTS FOUND!');
    } else {
      payments.forEach(p => {
        const wp_qr = p.qr_image ? '✓' : '✗';
        const profile_qr = p.profile_qr ? '✓' : '✗';
        console.log(`   Payment ${p.id}: Status=${p.payment_status}, Work QR=${wp_qr}, Profile QR=${profile_qr}`);
      });
    }

    console.log('\n=== DIAGNOSIS COMPLETE ===\n');

    process.exit(0);
  } catch(error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

diagnose();
