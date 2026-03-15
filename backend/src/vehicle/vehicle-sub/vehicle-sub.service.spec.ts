import { Test, TestingModule } from '@nestjs/testing';
import { VehicleSubService } from './vehicle-sub.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockVehicle = { id: 'v1', licensePlate: '51A-123.45', brand: 'Toyota', status: 'active', subscriptions: [], variableCosts: [] };

describe('VehicleSubService', () => {
  let service: VehicleSubService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findMany: jest.fn().mockResolvedValue([mockVehicle]),
        findUnique: jest.fn().mockResolvedValue({ ...mockVehicle, vendor: { name: 'Toyota' }, subscriptions: [{ monthlyCost: 5000000 }], variableCosts: [] }),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockVehicle),
        update: jest.fn().mockResolvedValue(mockVehicle),
      },
      vehicleServiceSubscription: { findMany: jest.fn().mockResolvedValue([{ id: 's1', monthlyCost: 5000000, service: { name: 'Insurance' } }]) },
      vehicleVariableCost: { aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 2000000 }, _count: 3 }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleSubService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<VehicleSubService>(VehicleSubService);
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const result = await service.findAll({});
      expect(result.success).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return vehicle with monthly total', async () => {
      const result = await service.findOne('v1');
      expect(result.success).toBe(true);
      expect(result.monthlyTotal).toBe(5000000);
    });
  });

  describe('create', () => {
    it('should create vehicle', async () => {
      const result = await service.create({ licensePlate: '51B' }, 'u1');
      expect(result.success).toBe(true);
    });
  });

  describe('update', () => {
    it('should update vehicle', async () => {
      const result = await service.update('v1', { brand: 'Honda' });
      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('should soft-delete vehicle', async () => {
      const result = await service.remove('v1');
      expect(result.success).toBe(true);
    });
  });

  describe('costSummary', () => {
    it('should return cost summary', async () => {
      const result = await service.costSummary('v1');
      expect(result.success).toBe(true);
      expect(result.data.fixedMonthly).toBe(5000000);
      expect(result.data.variableTotal).toBe(2000000);
    });
  });
});
