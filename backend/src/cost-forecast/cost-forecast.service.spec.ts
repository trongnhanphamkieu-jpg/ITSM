import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CostForecastService } from './cost-forecast.service';
import { PrismaService } from '../prisma/prisma.service';

const mockForecast = {
  id: 'f1', year: 2026, month: 3, name: 'Dự chi tháng 3/2026',
  status: 'draft', totalAmount: 500000000, notes: null,
  items: [{ id: 'i1', itemName: 'Server', estimatedAmount: 500000000, vendor: 'Dell', priority: 'high', projectId: null, notes: null, sortOrder: 0, description: null }],
  history: [], createdBy: { id: 'u1', fullName: 'Admin' }, approvedBy: null,
};

describe('CostForecastService', () => {
  let service: CostForecastService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      costForecast: {
        findMany: jest.fn().mockResolvedValue([mockForecast]),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'f1', ...mockForecast }),
        update: jest.fn().mockResolvedValue(mockForecast),
        delete: jest.fn(),
      },
      costForecastItem: {
        findMany: jest.fn().mockResolvedValue([{ estimatedAmount: 500000000 }]),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'i1' }),
        delete: jest.fn(),
      },
      costForecastHistory: { create: jest.fn() },
      actualCost: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CostForecastService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CostForecastService>(CostForecastService);
  });

  describe('findAll', () => {
    it('should return forecasts list', async () => {
      const result = await service.findAll({});
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by year', async () => {
      await service.findAll({ year: '2026' });
      expect(prisma.costForecast.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return forecast by id', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      const result = await service.findOne('f1');
      expect(result.id).toBe('f1');
    });

    it('should throw NotFoundException', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create forecast', async () => {
      prisma.costForecast.findFirst.mockResolvedValue(null);
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      const result = await service.create({ year: 2026, month: 4 }, 'u1');
      expect(result.id).toBe('f1');
    });

    it('should throw on duplicate month/year', async () => {
      prisma.costForecast.findFirst.mockResolvedValue(mockForecast);
      await expect(service.create({ year: 2026, month: 3 }, 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update draft forecast', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      await service.update('f1', { name: 'Updated' });
      expect(prisma.costForecast.update).toHaveBeenCalled();
    });

    it('should throw for non-draft', async () => {
      prisma.costForecast.findUnique.mockResolvedValue({ ...mockForecast, status: 'approved' });
      await expect(service.update('f1', {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete draft forecast', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      await service.remove('f1');
      expect(prisma.costForecast.delete).toHaveBeenCalled();
    });

    it('should throw for non-draft', async () => {
      prisma.costForecast.findUnique.mockResolvedValue({ ...mockForecast, status: 'pending' });
      await expect(service.remove('f1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    it('should submit draft with items', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      await service.submit('f1', 'u1');
      expect(prisma.costForecast.update).toHaveBeenCalled();
    });

    it('should throw for empty items', async () => {
      prisma.costForecast.findUnique.mockResolvedValue({ ...mockForecast, items: [] });
      await expect(service.submit('f1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve pending forecast', async () => {
      prisma.costForecast.findUnique.mockResolvedValue({ ...mockForecast, status: 'pending' });
      await service.approve('f1', 'u1');
      expect(prisma.costForecast.update).toHaveBeenCalled();
    });

    it('should throw for non-pending', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      await expect(service.approve('f1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject pending forecast', async () => {
      prisma.costForecast.findUnique.mockResolvedValue({ ...mockForecast, status: 'pending' });
      await service.reject('f1', 'u1', 'Not ready');
      expect(prisma.costForecast.update).toHaveBeenCalled();
    });
  });

  describe('yearlySummary', () => {
    it('should return 12 months summary', async () => {
      const result = await service.yearlySummary(2026);
      expect(result).toHaveLength(12);
    });
  });

  describe('vsActual', () => {
    it('should compare forecast vs actual', async () => {
      prisma.costForecast.findUnique.mockResolvedValue(mockForecast);
      const result = await service.vsActual('f1');
      expect(result.forecastTotal).toBe(500000000);
      expect(result.actualTotal).toBe(0);
    });
  });
});
