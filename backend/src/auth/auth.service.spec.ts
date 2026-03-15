import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

const mockUser = {
  id: 'u1',
  fullName: 'Admin',
  email: 'admin@test.com',
  role: 'admin',
  department: 'IT',
  phone: null,
  avatarUrl: null,
  passwordHash: 'hashed',
  status: 'active',
  failedAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };
  let jwt: { signAsync: jest.Mock; verifyAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token'), verifyAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('secret') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login('admin@test.com', 'pass');

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('token');
      expect(result.data.refreshToken).toBe('token');
      expect(result.data.user.email).toBe('admin@test.com');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('x@x.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for locked account', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, status: 'locked' });
      await expect(service.login('admin@test.com', 'pass')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for inactive account', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, status: 'inactive' });
      await expect(service.login('admin@test.com', 'pass')).rejects.toThrow(ForbiddenException);
    });

    it('should increment failedAttempts on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.update.mockResolvedValue(mockUser);

      await expect(service.login('admin@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return new access token on valid refresh', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1' });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshToken('valid-refresh');
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('token');
    });

    it('should throw for inactive user refresh', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1' });
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, status: 'locked' });

      await expect(service.refreshToken('valid')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for expired refresh token', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('expired'));
      await expect(service.refreshToken('expired')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getProfile('u1');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw for unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('unknown')).rejects.toThrow(UnauthorizedException);
    });
  });
});
