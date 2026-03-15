import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService — Security Tests', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  const mockUser = {
    id: 'user-1',
    email: 'test@company.com',
    fullName: 'Test User',
    passwordHash: '',
    role: 'staff',
    status: 'active',
    department: 'IT',
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    twoFaEnabled: false,
    twoFaSecret: null,
    phone: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def?: string) => {
              const env: Record<string, string> = {
                JWT_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_ACCESS_TTL: '8h',
                JWT_REFRESH_TTL: '7d',
              };
              return env[key] || def;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  // ── Lockout Tests ──

  describe('Account Lockout', () => {
    it('should reject login if account is locked and lockout not expired', async () => {
      const lockedUser = {
        ...mockUser,
        status: 'locked',
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(lockedUser);

      await expect(service.login('test@company.com', 'password123')).rejects.toThrow(ForbiddenException);
    });

    it('should auto-unlock account if lockout has expired', async () => {
      const expiredLockUser = {
        ...mockUser,
        status: 'locked',
        lockedUntil: new Date(Date.now() - 1000), // expired 1 second ago
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(expiredLockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...expiredLockUser, status: 'active' });

      const result = await service.login('test@company.com', 'password123');
      expect(result.success).toBe(true);

      // Verify auto-unlock was called
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'active', failedAttempts: 0, lockedUntil: null }),
        }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const userWith4Fails = { ...mockUser, failedAttempts: 4 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWith4Fails);
      (prisma.user.update as jest.Mock).mockResolvedValue(userWith4Fails);

      await expect(service.login('test@company.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'locked',
          }),
        }),
      );
    });

    it('should reset failed attempts on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, failedAttempts: 3 });
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('test@company.com', 'password123');
      expect(result.success).toBe(true);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedAttempts: 0, lockedUntil: null }),
        }),
      );
    });
  });

  // ── JWT Separation Tests ──

  describe('JWT Secret Separation', () => {
    it('should use JWT_REFRESH_SECRET for refresh token generation', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await service.login('test@company.com', 'password123');

      // Second signAsync call is for refresh token
      const signCalls = (jwt.signAsync as jest.Mock).mock.calls;
      const refreshCall = signCalls[1]; // [payload, options]
      expect(refreshCall[1].secret).toBe('test-refresh-secret');
    });

    it('should verify refresh token with JWT_REFRESH_SECRET', async () => {
      const mockPayload = { sub: 'user-1', email: 'test@company.com', role: 'staff' };
      (jwt.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await service.refreshToken('some-refresh-token');

      expect(jwt.verifyAsync).toHaveBeenCalledWith('some-refresh-token', {
        secret: 'test-refresh-secret',
      });
    });

    it('should reject expired refresh token', async () => {
      (jwt.verifyAsync as jest.Mock).mockRejectedValue(new Error('Token expired'));

      await expect(service.refreshToken('expired-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should reject refresh for inactive user', async () => {
      const mockPayload = { sub: 'user-1', email: 'test@company.com', role: 'staff' };
      (jwt.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, status: 'inactive' });

      await expect(service.refreshToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Basic Auth Tests ──

  describe('Login', () => {
    it('should reject invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.login('wrong@email.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should reject inactive user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, status: 'inactive' });
      await expect(service.login('test@company.com', 'password')).rejects.toThrow(ForbiddenException);
    });

    it('should return user data on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login('test@company.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe('test@company.com');
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
    });

    it('should increment failedAttempts on wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser, failedAttempts: 1,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.login('test@company.com', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ failedAttempts: { increment: 1 } }),
        }),
      );
    });

    it('should reset failedAttempts on successful login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser, failedAttempts: 3,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await service.login('test@company.com', 'password123');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedAttempts: 0 }),
        }),
      );
    });

    it('should auto-unlock if lockedUntil has passed', async () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser, status: 'locked', lockedUntil: pastDate, failedAttempts: 5,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser, status: 'active', failedAttempts: 0, lockedUntil: null,
      });

      const result = await service.login('test@company.com', 'password123');
      expect(result.success).toBe(true);
    });

    it('should reject locked account when lock not expired', async () => {
      const futureDate = new Date(Date.now() + 600000); // 10 min from now
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser, status: 'locked', lockedUntil: futureDate,
      });

      await expect(service.login('test@company.com', 'password123')).rejects.toThrow(ForbiddenException);
    });
  });
});
