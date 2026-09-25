// File: scripts/create-admin.mjs
// Pakai:
//   node --env-file=.env.local scripts/create-admin.mjs <nama> <password>
import bcrypt from "bcryptjs";
import pg from "pg";

const [nama, password] = process.argv.slice(2);

if (!nama || !password) {
  console.error("Pakai: node --env-file=.env.local scripts/create-admin.mjs <nama> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password minimal 8 karakter");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admin (nama, password_hash) VALUES ($1, $2)
     ON CONFLICT (nama) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [nama, hash],
  );
  console.log(`Admin "${nama}" siap dipakai.`);
} finally {
  await pool.end();
}
