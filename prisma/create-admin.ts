/**
 * prisma/create-admin.ts
 * Safely seeds/upserts a default admin user.
 * Run with: npx tsx prisma/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Checking for admin user...\n');

  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@jobfather.com';
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'adminpassword123';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`ℹ️ Admin user already exists with email: ${adminEmail}`);
    // If it exists but is not ADMIN, promote it
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
      });
      console.log('⚡ Promoted existing user to ADMIN role!');
    }
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Jobfather Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('🎉 Successfully created admin user!');
  console.log('------------------------------------');
  console.log(`Email:    ${admin.email}`);
  console.log(`Password: ${defaultPassword}`);
  console.log('------------------------------------');
  console.log('⚠️  WARNING: Please change this password immediately after logging in.');
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
