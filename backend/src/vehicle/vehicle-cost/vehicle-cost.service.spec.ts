import { Test, TestingModule } from '@nestjs/testing';
import { VehicleCostService } from './vehicle-cost.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockItem = { id: 'c1', amount: 500000, vehicleId: 'v1', createdAt: new Date() };

describe('VehicleCostService', () => {
  let service: VehicleCostService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vehicleVariableCost: {
        findMany: jest.fn().mockResolvedValue([mockItem]),
        findUnique: jest.fn().mockResolvedValue(mockItem),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockItem),
        update: jest.fn().mockResolvedValue(mockItem),
        delete: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 500000 } }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleCostService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<VehicleCostService>(VehicleCostService);
  });

  it('findAll returns paginated list', async () => {
    const result = await service.findAll({});
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('findOne returns item', async () => {
    const result = await service.findOne('c1');
    expect(result.success).toBe(true);
  });

  it('create returns item', async () => {
    const result = await service.create({ vehicleId: 'v1', amount: 500000, date: '2026-03-15' } as any, 'u1');
    expect(result.success).toBe(true);
  });

  it('update returns item', async () => {
    const result = await service.update('c1', { amount: 600000 } as any);
    expect(result.success).toBe(true);
  });

  it('remove deletes item', async () => {
    const result = await service.remove('c1');
    expect(result.success).toBe(true);
  });
});
