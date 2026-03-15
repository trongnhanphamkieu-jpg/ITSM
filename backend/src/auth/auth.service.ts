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
