#!/usr/bin/env node

const db = require('./backend/config/db');
const axios = require('axios');

async function testNewComplaint() {
  try {
    console.log('\n=== TESTING NEW COMPLAINT CREATION ===\n');

    // First, check current worker status
    console.log('Current Worker Workload:');
    const [workers] = await db.query(`
      SELECT u.id, u.name, w.category, w.current_tasks
      FROM users u
      JOIN workers w ON u.id = w.user_id
      WHERE u.role = 'WORKER'
      ORDER BY w.current_tasks ASC
    `);

    workers.forEach(w => {
      console.log(`  ${w.name.padEnd(20)} (${w.category.padEnd(12)}): ${w.current_tasks} tasks`);
    });

    //Create NEW complaint in "Others" category
    console.log('\n\nCreating test complaint with "Others" category...');
    
    const [result] = await db.query(`
      INSERT INTO complaints 
      (title, description, category, resident_id, priority, ai_category, status, worker_id, assigned_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Test complaint - should be assigned to worker with fewest tasks',
      'This is a test complaint to verify worker assignment logic',
      'Others',
      1,  // First resident user ID
      'MEDIUM',
      'Others',  // AI Category is Others
      'ASSIGNED',
      workers[0].id,  // Should be assigned to worker with fewest tasks
      new Date()
    ]);

    console.log(`✓ Complaint created: ID ${result.insertId}`);

    // Check if it was assigned
    const [newComplaint] = await db.query(`
      SELECT c.id, c.title, c.ai_category, c.status, c.worker_id, u.name as worker_name
      FROM complaints c
      LEFT JOIN users u ON c.worker_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    if (newComplaint.length > 0) {
      const c = newComplaint[0];
      const assigned = c.worker_id ? `✓ ${c.worker_name}` : '✗ UNASSIGNED';
      console.log(`  Status: ${c.status}`);
      console.log(`  Category: ${c.ai_category}`);
      console.log(`  Assigned to: ${assigned}`);
    }

    // Check worker task counts after
    console.log('\n\nWorker Workload After Assignment:');
    const [workers2] = await db.query(`
      SELECT u.id, u.name, w.category, w.current_tasks
      FROM users u
      JOIN workers w ON u.id = w.user_id
      WHERE u.role = 'WORKER'
      ORDER BY w.current_tasks ASC
    `);

    workers2.forEach(w => {
      console.log(`  ${w.name.padEnd(20)} (${w.category.padEnd(12)}): ${w.current_tasks} tasks`);
    });

    process.exit(0);
  } catch(error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

testNewComplaint();
