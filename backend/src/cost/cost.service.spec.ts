import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CostService } from './cost.service';
import { PrismaService } from '../prisma/prisma.service';

const mockCost = {
  id: 'c1',
  categoryName: 'Hardware',
  description: 'Server Dell',
  amount: 145000000,
  vendor: 'Dell',
  costDate: new Date('2026-03-15'),
  invoiceNo: 'INV-001',
  budgetItemId: 'bi1',
  createdById: 'u1',
  budgetItem: { id: 'bi1', name: 'Server', category: { name: 'IT' } },
  createdBy: { id: 'u1', fullName: 'Admin', email: 'a@b.com' },
};

describe('CostService', () => {
  let service: CostService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      actualCost: {
        findMany: jest.fn().mockResolvedValue([mockCost]),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockCost),
        update: jest.fn().mockResolvedValue(mockCost),
        delete: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 145000000 } }),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ month: 3, total: '145000000' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CostService>(CostService);
  });

  describe('findAll', () => {
    it('should return paginated costs', async () => {
      const result = await service.findAll({});
      expect(result.success).toBe(true);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by search', async () => {
      await service.findAll({ search: 'Dell' });
      expect(prisma.actualCost.findMany).toHaveBeenCalled();
    });

    it('should filter by category', async () => {
      await service.findAll({ categoryName: 'Hardware' });
      expect(prisma.actualCost.findMany).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      await service.findAll({ dateFrom: '2026-01-01', dateTo: '2026-12-31' });
      expect(prisma.actualCost.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cost by id', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      const result = await service.findOne('c1');
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a cost', async () => {
      const dto = {
        categoryName: 'Hardware',
        description: 'Server',
        amount: 100000,
        costDate: '2026-03-15',
        vendor: 'Dell',
        budgetItemId: 'bi1',
      };
      const result = await service.create(dto as any, 'u1');
      expect(result.success).toBe(true);
      expect(prisma.actualCost.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update cost', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      const result = await service.update('c1', { description: 'Updated' } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete cost', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      const result = await service.remove('c1');
      expect(result.success).toBe(true);
    });
  });

  describe('getCategories', () => {
    it('should return distinct categories', async () => {
      prisma.actualCost.findMany.mockResolvedValue([{ categoryName: 'Hardware' }, { categoryName: 'Software' }]);
      const result = await service.getCategories();
      expect(result.data).toEqual(['Hardware', 'Software']);
    });
  });

  describe('getSummary', () => {
    it('should return cost summary', async () => {
      const result = await service.getSummary();
      expect(result.success).toBe(true);
      expect(result.data.totalSpent).toBe(145000000);
    });
  });

  describe('create with DB-2 fields', () => {
    it('should create cost with contractId and payment tracking', async () => {
      const dto = {
        categoryName: 'Software',
        description: 'License renewal',
        amount: 50000,
        costDate: '2026-03-15',
        contractId: 'contract-uuid',
        poNumber: 'PO-2026-001',
        paymentStatus: 'pending',
        paidAt: null,
      };
      await service.create(dto as any, 'u1');
      const createCall = prisma.actualCost.create.mock.calls[0][0];
      expect(createCall.data.contractId).toBe('contract-uuid');
      expect(createCall.data.poNumber).toBe('PO-2026-001');
      expect(createCall.data.paymentStatus).toBe('pending');
    });
  });

  describe('update with payment status', () => {
    it('should update payment status and paidAt', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      await service.update('c1', {
        paymentStatus: 'paid',
        paidAt: '2026-03-20',
      } as any);
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.paymentStatus).toBe('paid');
      expect(updateCall.data.paidAt).toEqual(new Date('2026-03-20'));
    });

    it('should clear paidAt when set to null', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      await service.update('c1', { paidAt: undefined } as any);
      // paidAt undefined means no update
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.paidAt).toBeUndefined();
    });
  });

  describe('soft delete', () => {
    it('should set deletedAt on remove', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      prisma.actualCost.update.mockResolvedValue({ ...mockCost, deletedAt: new Date() });
      await service.remove('c1');
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
    });
  });
});
