import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPlan = {
  id: 'p1',
  code: 'NS2026-001',
  name: 'Test Plan',
  year: 2026,
  quarter: null,
  description: 'desc',
  status: 'draft',
  totalAmount: 100000,
  createdById: 'u1',
  approvedById: null,
  approvedAt: null,
  rejectionNote: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  categories: [],
  createdBy: { id: 'u1', fullName: 'Admin', email: 'a@b.com' },
  approvedBy: null,
};

describe('BudgetService', () => {
  let service: BudgetService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      budgetPlan: {
        findMany: jest.fn().mockResolvedValue([mockPlan]),
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockPlan),
        update: jest.fn().mockResolvedValue(mockPlan),
        delete: jest.fn(),
      },
      budgetCategory: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
      budgetItem: {
        findMany: jest.fn().mockResolvedValue([{ totalPrice: 50000 }, { totalPrice: 50000 }]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  describe('findAll', () => {
    it('should return paginated list', async () => {
      const result = await service.findAll(1, 20);
      expect(result.success).toBe(true);
      expect(result.meta.total).toBe(1);
    });

    it('should apply search filter', async () => {
      await service.findAll(1, 20, 'test');
      expect(prisma.budgetPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
      );
    });

    it('should apply year filter', async () => {
      await service.findAll(1, 20, undefined, 2026);
      expect(prisma.budgetPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ year: 2026 }) }),
      );
    });
  });

  describe('findOne', () => {
    it('should return plan by id', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue(mockPlan);
      const result = await service.findOne('p1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('p1');
    });

    it('should throw NotFoundException', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a plan with categories', async () => {
      prisma.budgetPlan.count.mockResolvedValue(0);
      const dto = {
        name: 'New Plan',
        year: 2026,
        description: 'desc',
        categories: [
          { name: 'Cat1', items: [{ name: 'Item1', unit: 'unit', quantity: 1, unitPrice: 100000 }] },
        ],
      };
      const result = await service.create(dto as any, 'u1');
      expect(result.success).toBe(true);
      expect(prisma.budgetPlan.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update draft plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue(mockPlan);
      const result = await service.update('p1', { name: 'Updated' } as any);
      expect(result.success).toBe(true);
    });

    it('should throw for non-draft plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue({ ...mockPlan, status: 'approved' });
      await expect(service.update('p1', { name: 'x' } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete draft plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue(mockPlan);
      const result = await service.delete('p1');
      expect(result.success).toBe(true);
    });

    it('should throw for non-draft plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue({ ...mockPlan, status: 'approved' });
      await expect(service.delete('p1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitForApproval', () => {
    it('should change status to pending', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue(mockPlan);
      prisma.budgetPlan.update.mockResolvedValue({ ...mockPlan, status: 'pending' });
      const result = await service.submitForApproval('p1');
      expect(result.data.status).toBe('pending');
    });

    it('should throw for non-draft plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue({ ...mockPlan, status: 'approved' });
      await expect(service.submitForApproval('p1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve pending plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue({ ...mockPlan, status: 'pending' });
      prisma.budgetPlan.update.mockResolvedValue({ ...mockPlan, status: 'approved' });
      const result = await service.approve('p1', 'u1');
      expect(result.data.status).toBe('approved');
    });

    it('should throw for non-pending plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue(mockPlan);
      await expect(service.approve('p1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject pending plan', async () => {
      prisma.budgetPlan.findUnique.mockResolvedValue({ ...mockPlan, status: 'pending' });
      prisma.budgetPlan.update.mockResolvedValue({ ...mockPlan, status: 'rejected' });
      const result = await service.reject('p1', 'u1', 'Not ready');
      expect(result.data.status).toBe('rejected');
    });
  });
});
