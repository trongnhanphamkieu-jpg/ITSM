import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

const mockCache = { wrap: jest.fn((key, fn) => fn()), get: jest.fn(), set: jest.fn(), del: jest.fn() };

const mockPlan = {
  id: 'p1', name: 'Plan 1', status: 'approved',
  categories: [{ items: [{ totalPrice: 100000 }, { totalPrice: 200000 }] }],
  createdBy: { fullName: 'Admin' },
};

describe('ReportService', () => {
  let service: ReportService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      budgetPlan: { findMany: jest.fn().mockResolvedValue([mockPlan]) },
      actualCost: { findMany: jest.fn().mockResolvedValue([{ amount: 50000, costDate: new Date('2026-03-01') }]) },
      costForecast: { findFirst: jest.fn().mockResolvedValue({ totalAmount: 80000, status: 'approved' }) },
      hardwareAsset: { count: jest.fn().mockResolvedValue(2) },
      infraResource: { count: jest.fn().mockResolvedValue(1) },
      ipAddress: { count: jest.fn().mockResolvedValue(3) },
      emailAccount: { count: jest.fn().mockResolvedValue(5) },
      domain: { count: jest.fn().mockResolvedValue(2) },
      vpsServer: { count: jest.fn().mockResolvedValue(1) },
      softwareLicense: { count: jest.fn().mockResolvedValue(4) },
      sslCertificate: { count: jest.fn().mockResolvedValue(2) },
      vehicle: { count: jest.fn().mockResolvedValue(1) },
      project: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportService, { provide: PrismaService, useValue: prisma }, { provide: CacheService, useValue: mockCache }],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  describe('getBudgetSummary', () => {
    it('should return budget summary for year', async () => {
      const result = await service.getBudgetSummary(2026);
      expect(result.year).toBe(2026);
      expect(result.totalBudget).toBe(300000);
      expect(result.planCount).toBe(1);
    });

    it('should calculate utilization percentage', async () => {
      const result = await service.getBudgetSummary(2026);
      expect(result.utilizationPct).toBeGreaterThan(0);
    });

    it('should handle zero budget', async () => {
      prisma.budgetPlan.findMany.mockResolvedValue([]);
      prisma.actualCost.findMany.mockResolvedValue([]);
      const result = await service.getBudgetSummary(2026);
      expect(result.utilizationPct).toBe(0);
    });
  });

  describe('getCostComparison', () => {
    it('should return 12 months of comparison', async () => {
      const result = await service.getCostComparison(2026);
      expect(result.months).toHaveLength(12);
      expect(result.year).toBe(2026);
    });

    it('should include forecast data', async () => {
      const result = await service.getCostComparison(2026);
      expect(result.months[0].forecastAmount).toBe(80000);
    });
  });

  describe('getAssetOverview', () => {
    it('should return total and breakdown', async () => {
      const result = await service.getAssetOverview();
      expect(result.totalAssets).toBe(21);
      expect(result.breakdown).toHaveLength(9);
    });
  });

  describe('getProjectBudgetReport', () => {
    it('should return empty for no projects', async () => {
      const result = await service.getProjectBudgetReport(2026);
      expect(result).toEqual([]);
    });
  });
});
