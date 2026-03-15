import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VendorPayableService } from './vendor-payable.service';
import { PrismaService } from '../prisma/prisma.service';

const mockVendor = { id: 'v1', name: 'Dell', code: 'NCC-0001', status: 'active' };

const mockCosts = [
  { id: 'c1', categoryName: 'Hardware', description: 'Server', amount: 100000, paidAmount: 50000, costDate: new Date(), paymentStatus: 'partial_paid', invoiceNo: 'INV-001' },
  { id: 'c2', categoryName: 'Software', description: 'License', amount: 200000, paidAmount: 200000, costDate: new Date(), paymentStatus: 'paid', invoiceNo: 'INV-002' },
  { id: 'c3', categoryName: 'Service', description: 'Support', amount: 80000, paidAmount: null, costDate: new Date(), paymentStatus: 'pending', invoiceNo: null },
];

describe('VendorPayableService', () => {
  let service: VendorPayableService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vendor: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      actualCost: {
        findMany: jest.fn(),
        aggregate: jest.fn(),
      },
      vendorReconciliation: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorPayableService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VendorPayableService>(VendorPayableService);
  });

  describe('getPayables', () => {
    it('should return aggregated payables for a vendor', async () => {
      prisma.vendor.findUnique.mockResolvedValue(mockVendor);
      prisma.actualCost.findMany.mockResolvedValue(mockCosts);

      const result = await service.getPayables('v1');
      expect(result.success).toBe(true);
      expect(result.data.totalAmount).toBe(380000);
      expect(result.data.totalPaid).toBe(250000);
      expect(result.data.totalUnpaid).toBe(130000);
      expect(result.data.costCount).toBe(3);
    });

    it('should throw NotFoundException for invalid vendor', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);
      await expect(service.getPayables('xxx')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPayablesSummary', () => {
    it('should return summary across vendors', async () => {
      prisma.vendor.findMany.mockResolvedValue([mockVendor]);
      prisma.actualCost.aggregate.mockResolvedValue({
        _sum: { amount: 380000, paidAmount: 250000 },
        _count: 3,
      });

      const result = await service.getPayablesSummary();
      expect(result.success).toBe(true);
      expect(result.data.vendors).toHaveLength(1);
      expect(result.data.summary.totalUnpaid).toBe(130000);
    });
  });

  describe('createReconciliation', () => {
    it('should create reconciliation snapshot', async () => {
      prisma.vendor.findUnique.mockResolvedValue(mockVendor);
      prisma.actualCost.findMany.mockResolvedValue([mockCosts[0], mockCosts[2]]);
      const mockRecon = { id: 'r1', vendorId: 'v1', items: [], confirmer: { id: 'u1', fullName: 'Admin' } };
      prisma.vendorReconciliation.create.mockResolvedValue(mockRecon);

      const result = await service.createReconciliation('v1', {
        costIds: ['c1', 'c3'],
        notes: 'Đối soát tháng 3',
      }, 'u1');

      expect(result.success).toBe(true);
      expect(prisma.vendorReconciliation.create).toHaveBeenCalled();
    });
  });

  describe('getReconciliations', () => {
    it('should return reconciliation history', async () => {
      prisma.vendorReconciliation.findMany.mockResolvedValue([
        { id: 'r1', reconciliationDate: new Date(), confirmer: { id: 'u1', fullName: 'Admin' }, _count: { items: 2 } },
      ]);

      const result = await service.getReconciliations('v1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getReconciliationDetail', () => {
    it('should return detail with items', async () => {
      prisma.vendorReconciliation.findFirst.mockResolvedValue({
        id: 'r1',
        items: [{ actualCostId: 'c1', amount: 100000, status: 'partial_paid' }],
      });
      prisma.actualCost.findMany.mockResolvedValue([mockCosts[0]]);

      const result = await service.getReconciliationDetail('v1', 'r1');
      expect(result.success).toBe(true);
      expect(result.data.items[0].actualCost).toBeTruthy();
    });

    it('should throw NotFoundException for invalid reconciliation', async () => {
      prisma.vendorReconciliation.findFirst.mockResolvedValue(null);
      await expect(service.getReconciliationDetail('v1', 'xxx')).rejects.toThrow(NotFoundException);
    });
  });
});
