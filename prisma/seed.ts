import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hash = await bcrypt.hash('AlGhawas@2025!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alghawasac.com' },
    update: {},
    create: {
      email: 'admin@alghawasac.com',
      password: hash,
      name: 'Admin',
      role: 'SuperAdmin',
      active: true,
    },
  });
  console.log('✅ Admin user seeded:', admin.email);

  // Seed settings
  await prisma.settings.upsert({
    where: { key: 'company_name' },
    update: {},
    create: { key: 'company_name', value: 'Al Ghawas A/C Refrigeration Contracting LLC' },
  });
  await prisma.settings.upsert({
    where: { key: 'whatsapp_number' },
    update: {},
    create: { key: 'whatsapp_number', value: '971506725808' },
  });

  console.log('✅ Settings seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
