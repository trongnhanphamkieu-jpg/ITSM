import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 ITMS — Seeding staging data...\n');

  // ── Users ──
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@itms.vn' },
    update: {},
    create: {
      email: 'admin@itms.vn',
      password: passwordHash,
      name: 'Admin ITMS',
      role: 'ADMIN',
      department: 'IT',
      phone: '0236-123-4567',
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@itms.vn' },
    update: {},
    create: {
      email: 'manager@itms.vn',
      password: passwordHash,
      name: 'Nguyễn Văn Quản Lý',
      role: 'MANAGER',
      department: 'IT',
      phone: '0236-123-4568',
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@itms.vn' },
    update: {},
    create: {
      email: 'staff@itms.vn',
      password: passwordHash,
      name: 'Trần Thị Nhân Viên',
      role: 'USER',
      department: 'IT',
      phone: '0236-123-4569',
      isActive: true,
    },
  });

  console.log(`✅ Users: ${admin.name}, ${manager.name}, ${staff.name}`);

  // ── Vendors ──
  const vendors = await Promise.all([
    prisma.vendor.upsert({
      where: { taxCode: '0101234567' },
      update: {},
      create: {
        name: 'FPT Telecom',
        taxCode: '0101234567',
        address: '17 Duy Tân, Cầu Giấy, Hà Nội',
        phone: '1900 6600',
        email: 'contact@fpt.vn',
        contactPerson: 'Nguyễn Văn A',
        status: 'ACTIVE',
      },
    }),
    prisma.vendor.upsert({
      where: { taxCode: '0107654321' },
      update: {},
      create: {
        name: 'Viettel IDC',
        taxCode: '0107654321',
        address: '1 Giang Văn Minh, Ba Đình, Hà Nội',
        phone: '1800 8168',
        email: 'idc@viettel.vn',
        contactPerson: 'Trần Văn B',
        status: 'ACTIVE',
      },
    }),
    prisma.vendor.upsert({
      where: { taxCode: '0109876543' },
      update: {},
      create: {
        name: 'Dell Technologies Vietnam',
        taxCode: '0109876543',
        address: 'Tầng 12, toà nhà Lim, Tôn Đức Thắng, Q1, HCM',
        phone: '028 3827 8888',
        email: 'sales@dell.com.vn',
        contactPerson: 'Mark Johnson',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ Vendors: ${vendors.map(v => v.name).join(', ')}`);

  // ── Projects ──
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { code: 'PRJ-ERP-2026' },
      update: {},
      create: {
        code: 'PRJ-ERP-2026',
        name: 'Triển khai ERP SAP',
        description: 'Triển khai hệ thống ERP SAP cho toàn công ty',
        budget: 5000000000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'ACTIVE',
        managerId: admin.id,
        createdById: admin.id,
      },
    }),
    prisma.project.upsert({
      where: { code: 'PRJ-DC-2026' },
      update: {},
      create: {
        code: 'PRJ-DC-2026',
        name: 'Nâng cấp Data Center',
        description: 'Nâng cấp hạ tầng data center, thay server mới',
        budget: 3000000000,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-09-30'),
        status: 'ACTIVE',
        managerId: manager.id,
        createdById: admin.id,
      },
    }),
    prisma.project.upsert({
      where: { code: 'PRJ-SEC-2026' },
      update: {},
      create: {
        code: 'PRJ-SEC-2026',
        name: 'Chương trình An toàn Thông tin',
        description: 'Triển khai ISO 27001 và bảo mật endpoint',
        budget: 1500000000,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-08-31'),
        status: 'ACTIVE',
        managerId: admin.id,
        createdById: admin.id,
      },
    }),
  ]);
  console.log(`✅ Projects: ${projects.map(p => p.code).join(', ')}`);

  console.log('\n🎉 Seed complete! Login: admin@itms.vn / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
