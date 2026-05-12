const db = require('./backend/config/db');

async function checkPaymentRecord() {
  try {
    const [payment] = await db.query(`
      SELECT * FROM work_payments WHERE complaint_id = 46 LIMIT 1
    `);

    console.log('\n=== WORK_PAYMENTS TABLE DATA (Complaint #46) ===\n');
    if (payment.length > 0) {
      const p = payment[0];
      console.log('ID:', p.id);
      console.log('Complaint ID:', p.complaint_id);
      console.log('Worker ID:', p.worker_id);
      console.log('QR Image field:', p.qr_image);
      console.log('UPI ID field:', p.upi_id);
      console.log('\n--- Full record ---');
      console.log(JSON.stringify(p, null, 2));
    }

    // Now check the worker profile
    console.log('\n=== WORKERS TABLE DATA (Lakshmi) ===\n');
    const [worker] = await db.query(`
      SELECT user_id, category, qr_image, upi_id FROM workers WHERE user_id = 26
    `);

    if (worker.length > 0) {
      const w = worker[0];
      console.log('User ID:', w.user_id);
      console.log('Category:', w.category);
      console.log('QR Image:', w.qr_image);
      console.log('UPI ID:', w.upi_id);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkPaymentRecord();
