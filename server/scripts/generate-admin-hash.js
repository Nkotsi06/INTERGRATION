// ============================================================
// generate-admin-hash.js
// ------------------------------------------------------------
// Generates a bcrypt hash for the admin password (Lomile@12).
//
// HOW TO USE:
//   1. Open a terminal
//   2. Navigate to the server folder:
//        cd server
//   3. Run:
//        node scripts/generate-admin-hash.js
//   4. Copy the hash that is printed
//   5. Paste it into server/src/database/schema.sql
//      (replace the placeholder: $2b$10$REPLACE_WITH_GENERATED_HASH)
//   6. Save schema.sql
// ============================================================

const { hashPassword } = require('../src/utils/passwordHash');

(async () => {
  try {
    const plainPassword = 'Lomile@12';
    const hash = await hashPassword(plainPassword);

    console.log('\n============================================================');
    console.log('  Admin password hash generated successfully');
    console.log('============================================================\n');
    console.log(`  Username:  Nqosa`);
    console.log(`  Password:  ${plainPassword}`);
    console.log(`  Hash:      ${hash}\n`);
    console.log('------------------------------------------------------------');
    console.log('  NEXT STEP');
    console.log('------------------------------------------------------------');
    console.log('  1. Open this file:');
    console.log('       server/src/database/schema.sql\n');
    console.log('  2. Find the line that says:');
    console.log("       '$2b$10$REPLACE_WITH_GENERATED_HASH'\n");
    console.log('  3. Replace it with the hash printed above.\n');
    console.log('  4. Save the file and run schema.sql against your Neon database.\n');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\nFailed to generate hash:', err.message);
    console.error('Make sure you are running this from the server/ folder.\n');
    process.exit(1);
  }
})();