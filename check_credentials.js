const db = require('./backend/config/db');

async function checkUserCredentials() {
  try {
    const [users] = await db.query('SELECT id, name, email, role, first_login FROM users LIMIT 5');
    console.log('Available users:');
    users.forEach(u => console.log(`  - ${u.email} (${u.role}) - First Login: ${u.first_login}`));

    // Check if there's a default password pattern
    console.log('\nChecking password hashes...');
    const [passwords] = await db.query('SELECT email, password FROM users LIMIT 5');
    passwords.forEach(p => console.log(`  ${p.email}: ${p.password.substring(0, 20)}...`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUserCredentials();
