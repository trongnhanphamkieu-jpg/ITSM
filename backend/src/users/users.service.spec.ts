import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

const mockUser = {
  id: 'u1', fullName: 'Test User', email: 'test@test.com',
  role: 'staff', status: 'active', department: 'IT',
  phone: null, avatarUrl: null, lastLoginAt: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([mockUser]),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should apply search filter', async () => {
      await service.findAll(1, 20, 'test');
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findOne('u1');
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const result = await service.create({ fullName: 'New', email: 'new@test.com', password: 'pass123' } as any);
      expect(result.success).toBe(true);
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(service.create({ email: 'test@test.com', password: 'x' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.update('u1', { fullName: 'Updated' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('disable', () => {
    it('should set user to inactive', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.disable('u1');
      expect(result.success).toBe(true);
    });
  });
});
