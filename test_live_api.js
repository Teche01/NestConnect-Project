#!/usr/bin/env node

const axios = require('axios');

async function testAPI() {
  console.log('\n=== TESTING LIVE API ===\n');

  try {
    // Check if backend is running
    const healthCheck = await axios.get('http://localhost:5000/api/test', {
      validateStatus: () => true
    }).catch(() => null);

    if (!healthCheck) {
      console.log('❌ Backend not responding on port 5000');
      process.exit(1);
    }

    console.log('✓ Backend is running\n');

    // Test 1: Get complaints (resident view)
    console.log('TEST 1: Get All Complaints');
    const complaintsRes = await axios.get('http://localhost:5000/api/complaints', {
      validateStatus: () => true,
      headers: {
        'Authorization': 'Bearer test'
      }
    });

    if (complaintsRes.status === 200 || complaintsRes.status === 401) {
      console.log(`  ✓ Endpoint responds (Status: ${complaintsRes.status})`);
    }

    // Test 2: Try getting a specific payment (where QR should show)
    console.log('\nTEST 2: Get Payment Details (for QR)');
    const paymentRes = await axios.get('http://localhost:5000/api/work/payment/1', {
      validateStatus: () => true,
      headers: {
        'Authorization': 'Bearer test'
      }
    });

    if (paymentRes.status === 200) {
      const payment = paymentRes.data?.data;
      if (payment) {
        console.log(`  ✓ Payment found`);
        console.log(`    - QR Image: ${payment.qr_image ? 'PRESENT' : 'NULL'}`);
        console.log(`    - Has QR: ${payment.has_qr}`);
        console.log(`    - Worker: ${payment.worker_name}`);
      }
    } else if (paymentRes.status === 401) {
      console.log(`  ℹ Auth required (Status: 401)`);
    } else if (paymentRes.status === 404) {
      console.log(`  ℹ Payment not found (Status: 404)`);
    } else {
      console.log(`  ✗ Error: ${paymentRes.status}`);
    }

    console.log('\n=== API TESTS COMPLETE ===\n');
    process.exit(0);

  } catch(error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

testAPI();
