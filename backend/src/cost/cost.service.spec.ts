import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CostService } from './cost.service';
import { PrismaService } from '../prisma/prisma.service';

const mockCost = {
  id: 'c1',
  categoryName: 'Hardware',
  description: 'Server Dell',
  amount: 145000000,
  paidAmount: null,
  vendor: 'Dell',
  costDate: new Date('2026-03-15'),
  invoiceNo: 'INV-001',
  budgetItemId: 'bi1',
  createdById: 'u1',
  paymentStatus: 'pending',
  paidAt: null,
  paymentDueDate: null,
  budgetItem: { id: 'bi1', name: 'Server', category: { name: 'IT' } },
  createdBy: { id: 'u1', fullName: 'Admin', email: 'a@b.com' },
  vendorRef: null,
  attachments: [],
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
        groupBy: jest.fn().mockResolvedValue([
          { paymentStatus: 'pending', _count: 3, _sum: { amount: 100000000 } },
          { paymentStatus: 'paid', _count: 2, _sum: { amount: 45000000 } },
        ]),
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

    it('should filter by paymentStatus', async () => {
      await service.findAll({ paymentStatus: 'pending' });
      const call = prisma.actualCost.findMany.mock.calls[0][0];
      expect(call.where.paymentStatus).toBe('pending');
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
    it('should create a cost with basic fields', async () => {
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

    it('should create cost with paidAmount and paymentDueDate', async () => {
      const dto = {
        categoryName: 'Software',
        description: 'License',
        amount: 50000,
        costDate: '2026-03-15',
        paidAmount: 25000,
        paymentDueDate: '2026-04-15',
      };
      await service.create(dto as any, 'u1');
      const createCall = prisma.actualCost.create.mock.calls[0][0];
      expect(createCall.data.paidAmount).toBe(25000);
      expect(createCall.data.paymentDueDate).toEqual(new Date('2026-04-15'));
    });
  });

  describe('update', () => {
    it('should update cost', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      const result = await service.update('c1', { description: 'Updated' } as any);
      expect(result.success).toBe(true);
    });

    it('should update paidAmount and paymentDueDate', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      await service.update('c1', {
        paidAmount: 50000,
        paymentDueDate: '2026-05-01',
      } as any);
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.paidAmount).toBe(50000);
      expect(updateCall.data.paymentDueDate).toEqual(new Date('2026-05-01'));
    });
  });

  describe('updatePayment', () => {
    it('should set partial_paid when paidAmount < amount', async () => {
      prisma.actualCost.findUnique.mockResolvedValue({ ...mockCost, amount: 100000 });
      prisma.actualCost.update.mockResolvedValue({ ...mockCost, paidAmount: 50000, paymentStatus: 'partial_paid' });
      const result = await service.updatePayment('c1', { paidAmount: 50000 });
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.paymentStatus).toBe('partial_paid');
      expect(updateCall.data.paidAmount).toBe(50000);
      expect(result.success).toBe(true);
    });

    it('should set paid when paidAmount >= amount', async () => {
      prisma.actualCost.findUnique.mockResolvedValue({ ...mockCost, amount: 100000 });
      prisma.actualCost.update.mockResolvedValue({ ...mockCost, paidAmount: 100000, paymentStatus: 'paid' });
      await service.updatePayment('c1', { paidAmount: 100000 });
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.paymentStatus).toBe('paid');
      expect(updateCall.data.paidAt).toBeInstanceOf(Date);
    });

    it('should set pending when paidAmount is 0', async () => {
      prisma.actualCost.findUnique.mockResolvedValue({ ...mockCost, amount: 100000, paidAmount: 50000 });
      prisma.actualCost.update.mockResolvedValue({ ...mockCost, paidAmount: 0, paymentStatus: 'pending' });
      await service.updatePayment('c1', { paidAmount: 0 });
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.paymentStatus).toBe('pending');
      expect(updateCall.data.paidAt).toBeNull();
    });

    it('should include note when provided', async () => {
      prisma.actualCost.findUnique.mockResolvedValue({ ...mockCost, amount: 100000 });
      prisma.actualCost.update.mockResolvedValue(mockCost);
      await service.updatePayment('c1', { paidAmount: 50000, note: 'Đợt 1' });
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.note).toBe('Đợt 1');
    });
  });

  describe('remove', () => {
    it('should soft delete cost', async () => {
      prisma.actualCost.findUnique.mockResolvedValue(mockCost);
      prisma.actualCost.update.mockResolvedValue({ ...mockCost, deletedAt: new Date() });
      const result = await service.remove('c1');
      expect(result.success).toBe(true);
      const updateCall = prisma.actualCost.update.mock.calls[0][0];
      expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
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
    it('should return cost summary with payment breakdown', async () => {
      const result = await service.getSummary();
      expect(result.success).toBe(true);
      expect(result.data.totalSpent).toBe(145000000);
      expect(result.data.paymentSummary).toHaveLength(2);
      expect(result.data.paymentSummary[0].status).toBe('pending');
    });
  });
});
