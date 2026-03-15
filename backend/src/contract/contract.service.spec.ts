import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContractService } from './contract.service';
import { PrismaService } from '../prisma/prisma.service';

const mockContract = {
  id: 'ct1', code: 'HD-2026-0001', name: 'Dell Support',
  vendorId: 'v1', startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'), value: 500000000,
  status: 'active', createdById: 'u1',
  vendor: { id: 'v1', name: 'Dell', code: 'NCC-0001', email: 'x@x.com', phone: '123' },
  attachments: [], createdBy: { id: 'u1', fullName: 'Admin' },
  _count: { attachments: 0 },
};

describe('ContractService', () => {
  let service: ContractService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      contract: {
        findMany: jest.fn().mockResolvedValue([mockContract]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockContract),
        update: jest.fn().mockResolvedValue(mockContract),
        delete: jest.fn(),
      },
      contractAttachment: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'a1' }),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  describe('findAll', () => {
    it('should return paginated contracts', async () => {
      const result = await service.findAll({});
      expect(result.success).toBe(true);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by vendorId', async () => {
      await service.findAll({ vendorId: 'v1' });
      expect(prisma.contract.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return contract by id', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      const result = await service.findOne('ct1');
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      prisma.contract.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create contract with generated code', async () => {
      prisma.contract.count.mockResolvedValue(0);
      const result = await service.create({
        name: 'New', vendorId: 'v1', startDate: '2026-01-01', endDate: '2026-12-31',
      } as any, 'u1');
      expect(result.success).toBe(true);
    });
  });

  describe('update', () => {
    it('should update contract', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      const result = await service.update('ct1', { name: 'Updated' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete contract', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      const result = await service.remove('ct1');
      expect(result.success).toBe(true);
    });
  });

  describe('addAttachment', () => {
    it('should add attachment to contract', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      const result = await service.addAttachment('ct1', {
        fileName: 'doc.pdf', fileSize: 1024, mimeType: 'application/pdf', storageKey: 'k1',
      }, 'u1');
      expect(result.success).toBe(true);
    });
  });

  describe('removeAttachment', () => {
    it('should remove attachment', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      prisma.contractAttachment.findFirst.mockResolvedValue({ id: 'a1' });
      const result = await service.removeAttachment('ct1', 'a1');
      expect(result.success).toBe(true);
    });

    it('should throw if attachment not found', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      prisma.contractAttachment.findFirst.mockResolvedValue(null);
      await expect(service.removeAttachment('ct1', 'x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getExpiringContracts', () => {
    it('should find contracts expiring in N days', async () => {
      const result = await service.getExpiringContracts(30);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('soft delete', () => {
    it('should set deletedAt on remove instead of hard delete', async () => {
      prisma.contract.findFirst.mockResolvedValue(mockContract);
      prisma.contract.update.mockResolvedValue({ ...mockContract, deletedAt: new Date() });
      await service.remove('ct1');
      const updateCall = prisma.contract.update.mock.calls[0][0];
      expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
    });

    it('findAll should include deletedAt:null in where clause', async () => {
      await service.findAll({});
      const findManyCall = prisma.contract.findMany.mock.calls[0][0];
      expect(findManyCall.where.deletedAt).toBeNull();
    });

    it('findOne should check deletedAt:null', async () => {
      prisma.contract.findFirst.mockResolvedValue(null);
      await expect(service.findOne('ct1')).rejects.toThrow(NotFoundException);
      const findCall = prisma.contract.findFirst.mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });
  });
});
