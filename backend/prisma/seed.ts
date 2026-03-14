import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@haivan.com' },
    update: {},
    create: {
      fullName: 'Admin ITMS',
      email: 'admin@haivan.com',
      passwordHash,
      role: 'admin',
      status: 'active',
      department: 'Phòng CNTT',
      phone: '0901234567',
    },
  });

  console.log('Seeded admin user:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
