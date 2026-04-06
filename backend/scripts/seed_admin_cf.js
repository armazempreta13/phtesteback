// Script para criar hash do admin para deploy do Cloudflare D1
// Usage: node scripts/seed_admin_cf.js "your-secure-password" "admin@email.com"

const bcrypt = require('bcryptjs');

async function main() {
  const password = process.argv[2] || 'Admin@123456';
  const email = process.argv[3] || 'admin@phstatic.com.br';

  if (password === 'Admin@123456') {
    console.warn('⚠️  WARNING: Using default admin password!');
    console.warn('   Change it immediately after deployment.');
    console.warn('   Usage: node scripts/seed_admin_cf.js "secure_password" "admin@email.com"');
  }

  const hashed = await bcrypt.hash(password, 12);

  console.log('\n--- Admin User for Cloudflare D1 ---');
  console.log(`Email: ${email}`);
  console.log(`Hash:  ${hashed}`);
  console.log('\nRun this SQL in D1:');
  console.log(`INSERT INTO users (name, email, password, role) VALUES ('PH Admin', '${email}', '${hashed}', 'admin');`);
  console.log('\nDone.');
}

main();
