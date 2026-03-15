import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DomainService } from './domain.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockItem = { id: 'item1', createdAt: new Date() };

describe('DomainService', () => {
  let service: DomainService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      domain: {
        findMany: jest.fn().mockResolvedValue([mockItem]),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockItem),
        update: jest.fn().mockResolvedValue(mockItem),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DomainService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DomainService>(DomainService);
  });

  describe('findAll', () => {
    it('should return paginated list', async () => {
      const result = await service.findAll({});
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return item by id', async () => {
      prisma.domain.findFirst.mockResolvedValue(mockItem);
      const result = await service.findOne('item1');
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      prisma.domain.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create item', async () => {
      const result = await service.create({} as any, 'u1');
      expect(result.success).toBe(true);
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      prisma.domain.findFirst.mockResolvedValue(mockItem);
      const result = await service.update('item1', {} as any);
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should soft-delete item', async () => {
      prisma.domain.findFirst.mockResolvedValue(mockItem);
      const result = await service.remove('item1');
      expect(result.success).toBe(true);
    });
  });
});
