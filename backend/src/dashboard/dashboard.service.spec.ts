import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

const mockCache = { wrap: jest.fn((key, fn) => fn()), get: jest.fn(), set: jest.fn(), del: jest.fn(), invalidateByPrefix: jest.fn(), reset: jest.fn() };

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(async () => {
    // $queryRaw is called multiple times: 1st for budget total, 2nd for budgetByCategory, 3rd for costByCategory
    const queryRawMock = jest.fn()
      .mockResolvedValueOnce([{ total: '13800000000' }])   // budget total from items
      .mockResolvedValueOnce([{ name: 'Hardware', total: '500000000' }]) // budgetByCategory
      .mockResolvedValueOnce([{ name: 'Hardware', total: '200000000' }]); // costByCategory

    prisma = {
      budgetPlan: {
        count: jest.fn().mockResolvedValue(4),
      },
      actualCost: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 700000000 } }),
      },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'a1', action: 'create', entityType: 'budget_plans', module: 'budget', user: { fullName: 'Admin' }, createdAt: new Date() },
        ]),
      },
      $queryRaw: queryRawMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getSummary', () => {
    it('should return dashboard summary with year filter', async () => {
      const result = await service.getSummary(2026);
      expect(result.success).toBe(true);
      expect(result.data.totalBudget).toBe(13800000000);
      expect(result.data.totalSpent).toBe(700000000);
      expect(result.data.planCount).toBe(4);
    });

    it('should calculate spentPercentage', async () => {
      const result = await service.getSummary(2026);
      expect(result.data.spentPercentage).toBeGreaterThan(0);
    });

    it('should return 0 spentPercentage if no budget', async () => {
      prisma.$queryRaw.mockReset();
      prisma.$queryRaw
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      const result = await service.getSummary(2026);
      expect(result.data.spentPercentage).toBe(0);
    });

    it('should filter by month', async () => {
      const result = await service.getSummary(2026, 3);
      expect(result.data.filterLabel).toContain('3');
    });

    it('should filter by quarter', async () => {
      const result = await service.getSummary(2026, undefined, 1);
      expect(result.data.filterLabel).toContain('1');
    });

    it('should include budgetVsActual chart data', async () => {
      const result = await service.getSummary(2026);
      expect(result.data.budgetVsActual).toBeDefined();
      expect(Array.isArray(result.data.budgetVsActual)).toBe(true);
    });

    it('should include recentActivity', async () => {
      const result = await service.getSummary(2026);
      expect(result.data.recentActivity).toHaveLength(1);
      expect(result.data.recentActivity[0].user).toBe('Admin');
    });
  });
});
