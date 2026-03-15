import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { PrismaService } from '../prisma/prisma.service';

const mockVendor = {
  id: 'v1',
  code: 'NCC-0001',
  name: 'Dell Vietnam',
  email: 'dell@test.com',
  phone: '0123456789',
  taxCode: '123456',
  address: 'HCM',
  status: 'active',
  createdById: 'u1',
  contracts: [],
  createdBy: { id: 'u1', fullName: 'Admin' },
  _count: { contracts: 0 },
};

describe('VendorService', () => {
  let service: VendorService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vendor: {
        findMany: jest.fn().mockResolvedValue([mockVendor]),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockVendor),
        update: jest.fn().mockResolvedValue(mockVendor),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
  });

  describe('findAll', () => {
    it('should return paginated vendors', async () => {
      const result = await service.findAll({});
      expect(result.success).toBe(true);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by search', async () => {
      await service.findAll({ search: 'Dell' });
      expect(prisma.vendor.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      await service.findAll({ status: 'active' });
      expect(prisma.vendor.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return vendor by id', async () => {
      prisma.vendor.findUnique.mockResolvedValue(mockVendor);
      const result = await service.findOne('v1');
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a vendor with generated code', async () => {
      prisma.vendor.count.mockResolvedValue(0);
      const result = await service.create({ name: 'New NCC', email: 'x@x.com' } as any, 'u1');
      expect(result.success).toBe(true);
    });
  });

  describe('update', () => {
    it('should update vendor', async () => {
      prisma.vendor.findUnique.mockResolvedValue(mockVendor);
      const result = await service.update('v1', { name: 'Updated' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should deactivate vendor', async () => {
      prisma.vendor.findUnique.mockResolvedValue(mockVendor);
      const result = await service.remove('v1');
      expect(result.success).toBe(true);
      expect(prisma.vendor.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'inactive' } }));
    });
  });
});
