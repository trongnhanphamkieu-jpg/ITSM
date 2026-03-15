import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.status === 'locked') {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new ForbiddenException('Tài khoản đã bị khóa. Vui lòng thử lại sau.');
      }
      // Lock expired — auto-unlock
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'active', failedAttempts: 0, lockedUntil: null },
      });
    }

    if (user.status === 'inactive') {
      throw new ForbiddenException('Tài khoản không hoạt động');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: { increment: 1 },
          ...(user.failedAttempts >= 4 && {
            status: 'locked',
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
          }),
        },
      });
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Reset failed attempts on success
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      data: {
        accessToken: await this.generateAccessToken(payload),
        refreshToken: await this.generateRefreshToken(payload),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET', this.config.get('JWT_SECRET')),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        success: true,
        data: {
          accessToken: await this.generateAccessToken(newPayload),
        },
      };
    } catch {
      throw new UnauthorizedException('Refresh token hết hạn');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { success: true, data: user };
  }

  async getMyPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, dynamicRoleId: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    // Try dynamic role first
    if (user.dynamicRoleId) {
      const role = await this.prisma.dynamicRole.findUnique({
        where: { id: user.dynamicRoleId },
        include: { permissions: true },
      });

      if (role?.isActive) {
        const moduleMap: Record<string, any> = {};
        for (const p of role.permissions) {
          moduleMap[p.module] = {
            canView: p.canView, canCreate: p.canCreate,
            canEdit: p.canEdit, canDelete: p.canDelete,
            canExport: p.canExport, canImport: p.canImport,
            canApprove: p.canApprove,
          };
        }
        return {
          success: true,
          data: {
            roleCode: role.code,
            roleName: role.name,
            isSystem: role.isSystem,
            modules: moduleMap,
          },
        };
      }
    }

    // Fallback: generate from legacy enum
    const MODULES = [
      'dashboard', 'budget_plan', 'actual_cost', 'vendor', 'contract',
      'soft_inventory', 'hard_inventory', 'infrastructure', 'vehicle',
      'cost_forecast', 'project', 'report', 'activity_log', 'master_data',
      'user_management',
    ];

    const isAdmin = user.role === 'admin';
    const isManager = user.role === 'manager';
    const isFinance = user.role === 'finance';
    const isViewer = user.role === 'viewer';

    const moduleMap: Record<string, any> = {};
    for (const m of MODULES) {
      moduleMap[m] = {
        canView: true,
        canCreate: isAdmin || isManager || (!isViewer),
        canEdit: isAdmin || isManager || (!isViewer),
        canDelete: isAdmin || isManager,
        canExport: true,
        canImport: isAdmin || isManager,
        canApprove: isAdmin || isManager || isFinance,
      };
    }

    return {
      success: true,
      data: {
        roleCode: user.role,
        roleName: user.role,
        isSystem: false,
        modules: moduleMap,
      },
    };
  }

  private async generateAccessToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_ACCESS_TTL', '8h'),
    });
  }

  private async generateRefreshToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET', this.config.get('JWT_SECRET')),
      expiresIn: this.config.get('JWT_REFRESH_TTL', '7d'),
    });
  }
}
