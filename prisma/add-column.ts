import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const result = await pool.query(
    `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "paymentScreenshot" TEXT;`
  );
  console.log('✅ Column added successfully:', result);
  await pool.end();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  pool.end().finally(() => process.exit(1));
});
