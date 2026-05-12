const db = require('./backend/config/db');

async function checkUsers() {
  try {
    const [users] = await db.query('SELECT id, name, email, role, first_login FROM users LIMIT 10');
    console.log('Available users:');
    users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
