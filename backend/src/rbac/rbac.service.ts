import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MODULE_CODES = [
  'dashboard', 'budget_plan', 'actual_cost', 'vendor', 'contract',
  'soft_inventory', 'hard_inventory', 'infrastructure', 'vehicle',
  'cost_forecast', 'project', 'report', 'activity_log', 'master_data',
  'user_management',
] as const;

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  // ── CRUD: DynamicRole ──

  async findAll() {
    return this.prisma.dynamicRole.findMany({
      include: { permissions: true, _count: { select: { users: true } } },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    const role = await this.prisma.dynamicRole.findUnique({
      where: { id },
      include: { permissions: true, _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: { code: string; name: string; description?: string; permissions?: any[] }) {
    return this.prisma.dynamicRole.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        isSystem: false,
        permissions: dto.permissions?.length ? {
          create: dto.permissions.map((p) => ({
            module: p.module,
            canView: p.canView ?? false,
            canCreate: p.canCreate ?? false,
            canEdit: p.canEdit ?? false,
            canDelete: p.canDelete ?? false,
            canExport: p.canExport ?? false,
            canImport: p.canImport ?? false,
            canApprove: p.canApprove ?? false,
          })),
        } : undefined,
      },
      include: { permissions: true },
    });
  }

  async update(id: string, dto: { name?: string; description?: string; isActive?: boolean; permissions?: any[] }) {
    const role = await this.prisma.dynamicRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem && dto.isActive === false) {
      throw new BadRequestException('Không thể vô hiệu hóa system role');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dynamicRole.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          isActive: dto.isActive,
        },
      });

      if (dto.permissions && !role.isSystem) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: dto.permissions.map((p) => ({
            roleId: id,
            module: p.module,
            canView: p.canView ?? false,
            canCreate: p.canCreate ?? false,
            canEdit: p.canEdit ?? false,
            canDelete: p.canDelete ?? false,
            canExport: p.canExport ?? false,
            canImport: p.canImport ?? false,
            canApprove: p.canApprove ?? false,
          })),
        });
      }

      return tx.dynamicRole.findUnique({
        where: { id },
        include: { permissions: true },
      });
    });
  }

  async remove(id: string) {
    const role = await this.prisma.dynamicRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new BadRequestException('Không thể xóa system role');
    if (role._count.users > 0) throw new BadRequestException('Role đang có người dùng sử dụng');
    await this.prisma.dynamicRole.delete({ where: { id } });
    return { success: true };
  }

  // ── Seed System Roles ──

  async seedSystemRoles() {
    const allTrue = MODULE_CODES.map((m) => ({
      module: m,
      canView: true, canCreate: true, canEdit: true,
      canDelete: true, canExport: true, canImport: true, canApprove: true,
    }));
    const viewOnly = MODULE_CODES.map((m) => ({
      module: m,
      canView: true, canCreate: false, canEdit: false,
      canDelete: false, canExport: true, canImport: false, canApprove: false,
    }));

    const roles = [
      { code: 'admin', name: 'Quản trị viên', description: 'Toàn quyền quản trị hệ thống', isSystem: true, permissions: allTrue },
      { code: 'viewer', name: 'Người xem', description: 'Chỉ xem dữ liệu, không thay đổi', isSystem: true, permissions: viewOnly },
      { code: 'manager', name: 'Quản lý', description: 'Quản lý và phê duyệt', isSystem: false, permissions: MODULE_CODES.map((m) => ({
        module: m, canView: true, canCreate: true, canEdit: true,
        canDelete: false, canExport: true, canImport: true, canApprove: true,
      })) },
      { code: 'staff', name: 'Nhân viên', description: 'Thao tác hàng ngày', isSystem: false, permissions: MODULE_CODES.map((m) => ({
        module: m, canView: true, canCreate: true, canEdit: true,
        canDelete: false, canExport: true, canImport: false, canApprove: false,
      })) },
      { code: 'finance', name: 'Kế toán', description: 'Quản lý tài chính và chi phí', isSystem: false, permissions: MODULE_CODES.map((m) => ({
        module: m,
        canView: true,
        canCreate: ['budget_plan', 'actual_cost', 'cost_forecast', 'report'].includes(m),
        canEdit: ['budget_plan', 'actual_cost', 'cost_forecast'].includes(m),
        canDelete: false,
        canExport: true,
        canImport: ['actual_cost'].includes(m),
        canApprove: ['budget_plan', 'actual_cost'].includes(m),
      })) },
    ];

    const results = [];
    for (const r of roles) {
      const existing = await this.prisma.dynamicRole.findUnique({ where: { code: r.code } });
      if (existing) {
        results.push({ code: r.code, status: 'exists' });
        continue;
      }
      await this.prisma.dynamicRole.create({
        data: {
          code: r.code,
          name: r.name,
          description: r.description,
          isSystem: r.isSystem,
          permissions: { create: r.permissions },
        },
      });
      results.push({ code: r.code, status: 'created' });
    }
    return results;
  }

  // ── Permission check helpers ──

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        dynamicRoleId: true,
        dynamicRole: { include: { permissions: true } },
      },
    });
    if (!user) return null;

    // If user has dynamic role, use its permissions
    if (user.dynamicRole?.permissions) {
      return user.dynamicRole.permissions;
    }

    // Fallback: legacy enum role → admin gets all, staff/etc get view
    if (user.role === 'admin') {
      return MODULE_CODES.map((m) => ({
        module: m, canView: true, canCreate: true, canEdit: true,
        canDelete: true, canExport: true, canImport: true, canApprove: true,
      }));
    }
    return MODULE_CODES.map((m) => ({
      module: m, canView: true, canCreate: false, canEdit: false,
      canDelete: false, canExport: false, canImport: false, canApprove: false,
    }));
  }

  getModuleCodes() {
    return [...MODULE_CODES];
  }
}
