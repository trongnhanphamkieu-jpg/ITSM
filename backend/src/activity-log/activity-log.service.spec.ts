import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../prisma/prisma.service';

const mockLog = {
  id: 'l1', userId: 'u1', module: 'budget_plans', action: 'create',
  entityType: 'BudgetPlan', entityId: 'p1', createdAt: new Date(),
  user: { id: 'u1', fullName: 'Admin', email: 'a@b.com', role: 'admin' },
};

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      auditLog: {
        findMany: jest.fn().mockResolvedValue([mockLog]),
        count: jest.fn().mockResolvedValue(1),
        groupBy: jest.fn().mockResolvedValue([{ module: 'budget_plans', _count: 5 }]),
        create: jest.fn().mockResolvedValue(mockLog),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityLogService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  describe('findAll', () => {
    it('should return paginated logs', async () => {
      const result = await service.findAll({});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by module', async () => {
      await service.findAll({ module: 'budget_plans' });
      expect(prisma.auditLog.findMany).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      await service.findAll({ from: '2026-01-01', to: '2026-12-31' });
      expect(prisma.auditLog.findMany).toHaveBeenCalled();
    });
  });

  describe('getMyHistory', () => {
    it('should call findAll with userId', async () => {
      const result = await service.getMyHistory('u1', {});
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getStats', () => {
    it('should return aggregated stats', async () => {
      const result = await service.getStats({});
      expect(result.totalLogs).toBe(1);
      expect(result.byModule).toHaveLength(1);
    });
  });

  describe('getModules', () => {
    it('should return distinct modules', async () => {
      const result = await service.getModules();
      expect(result).toEqual(['budget_plans']);
    });
  });

  describe('createLog', () => {
    it('should create audit log entry', async () => {
      const result = await service.createLog({
        userId: 'u1', module: 'budget_plans', action: 'create',
        entityType: 'BudgetPlan',
      });
      expect(result.id).toBe('l1');
    });
  });
});
