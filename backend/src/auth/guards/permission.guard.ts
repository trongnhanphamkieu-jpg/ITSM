import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const PERMISSION_KEY = 'required_permission';

/**
 * Decorator: @RequirePermission('budget_plan', 'create')
 * Checks user's dynamic role permissions from DB.
 */
export const RequirePermission = (module: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { module, action });

/**
 * Map action string → column name in role_permissions table
 */
const ACTION_TO_COLUMN: Record<string, string> = {
  view: 'canView',
  create: 'canCreate',
  edit: 'canEdit',
  delete: 'canDelete',
  export: 'canExport',
  import: 'canImport',
  approve: 'canApprove',
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{ module: string; action: string }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @RequirePermission → allow (public or auth-only endpoint)
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Chưa đăng nhập');

    // Admin role (legacy enum) → always allow
    if (user.role === 'admin') return true;

    const column = ACTION_TO_COLUMN[required.action];
    if (!column) throw new ForbiddenException(`Action không hợp lệ: ${required.action}`);

    // 1. Get user's dynamic role
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { dynamicRoleId: true, role: true },
    });

    if (dbUser?.dynamicRoleId) {
      const role = await this.prisma.dynamicRole.findUnique({
        where: { id: dbUser.dynamicRoleId },
        include: { permissions: { where: { module: required.module } } },
      });

      if (role?.isActive && role.permissions.length > 0) {
        const perm = role.permissions[0];
        if ((perm as any)[column] === true) return true;
        throw new ForbiddenException(
          `Bạn không có quyền ${required.action} trên module ${required.module}`,
        );
      }
    }

    // 2. Fallback: legacy enum role
    const legacyPermissions = this.getLegacyPermission(user.role, required.module, required.action);
    if (legacyPermissions) return true;

    throw new ForbiddenException(
      `Bạn không có quyền ${required.action} trên module ${required.module}`,
    );
  }

  /**
   * Fallback for users without dynamicRole: map enum role → permissions
   */
  private getLegacyPermission(role: string, _module: string, action: string): boolean {
    const legacyMap: Record<string, string[]> = {
      admin: ['view', 'create', 'edit', 'delete', 'export', 'import', 'approve'],
      manager: ['view', 'create', 'edit', 'export', 'import', 'approve'],
      staff: ['view', 'create', 'edit', 'export'],
      finance: ['view', 'create', 'edit', 'export', 'approve'],
      viewer: ['view', 'export'],
    };
    return legacyMap[role]?.includes(action) ?? false;
  }
}
