import { Test, TestingModule } from '@nestjs/testing';
import { VehicleSubscriptionService } from './vehicle-subscription.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockItem = {
  id: 'sub1', vehicleId: 'v1', serviceId: 's1', monthlyCost: 5000000, isActive: true,
  service: { name: 'Insurance', costType: 'fixed', frequency: 'monthly' },
  vehicle: { licensePlate: '51A-123.45', brand: 'Toyota', model: 'Camry' },
};

describe('VehicleSubscriptionService', () => {
  let service: VehicleSubscriptionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vehicleServiceSubscription: {
        findMany: jest.fn().mockResolvedValue([mockItem]),
        findUnique: jest.fn().mockResolvedValue(mockItem),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockItem),
        update: jest.fn().mockResolvedValue(mockItem),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleSubscriptionService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<VehicleSubscriptionService>(VehicleSubscriptionService);
  });

  it('findAll returns paginated list', async () => {
    const result = await service.findAll({});
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('findOne returns subscription', async () => {
    const result = await service.findOne('sub1');
    expect(result.success).toBe(true);
  });

  it('create returns subscription', async () => {
    const result = await service.create({ vehicleId: 'v1', serviceId: 's1', monthlyCost: 5000000 } as any);
    expect(result.success).toBe(true);
  });

  it('update returns subscription', async () => {
    const result = await service.update('sub1', { monthlyCost: 6000000 } as any);
    expect(result.success).toBe(true);
  });
});

