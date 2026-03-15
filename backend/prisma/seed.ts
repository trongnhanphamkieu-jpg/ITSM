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

  // ── Seed MasterCategory: budget_category ──
  const budgetCategories = [
    { code: 'BC-HW', name: 'Phần cứng', description: 'Server, PC, thiết bị mạng, linh kiện', sortOrder: 1 },
    { code: 'BC-SW', name: 'Phần mềm', description: 'License, SaaS, bản quyền phần mềm', sortOrder: 2 },
    { code: 'BC-SVC', name: 'Dịch vụ IT', description: 'Hosting, bảo trì, hỗ trợ kỹ thuật', sortOrder: 3 },
    { code: 'BC-NET', name: 'Hạ tầng mạng', description: 'Switch, router, cáp, firewall', sortOrder: 4 },
    { code: 'BC-SEC', name: 'An ninh thông tin', description: 'Security tools, pentest, audit', sortOrder: 5 },
    { code: 'BC-HR', name: 'Nhân sự IT', description: 'Đào tạo, chứng chỉ, tuyển dụng', sortOrder: 6 },
    { code: 'BC-PRJ', name: 'Dự án', description: 'Chi phí triển khai dự án mới', sortOrder: 7 },
    { code: 'BC-OTH', name: 'Khác', description: 'Chi phí IT khác', sortOrder: 8 },
  ];

  for (const cat of budgetCategories) {
    await prisma.masterCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: { ...cat, type: 'budget_category', isActive: true },
    });
  }
  console.log(`Seeded ${budgetCategories.length} budget_category master categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
