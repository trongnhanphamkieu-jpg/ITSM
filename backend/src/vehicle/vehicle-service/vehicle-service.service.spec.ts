import { Test, TestingModule } from '@nestjs/testing';
import { VehicleSvcService } from './vehicle-service.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockItem = { id: 's1', name: 'Insurance', costType: 'fixed', frequency: 'monthly', createdAt: new Date() };

describe('VehicleSvcService', () => {
  let service: VehicleSvcService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vehicleService: {
        findMany: jest.fn().mockResolvedValue([mockItem]),
        findUnique: jest.fn().mockResolvedValue(mockItem),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockItem),
        update: jest.fn().mockResolvedValue(mockItem),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleSvcService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<VehicleSvcService>(VehicleSvcService);
  });

  it('findAll returns paginated list', async () => {
    const result = await service.findAll({});
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('findOne returns item', async () => {
    const result = await service.findOne('s1');
    expect(result.success).toBe(true);
  });

  it('create returns item', async () => {
    const result = await service.create({ name: 'New Service', costType: 'fixed' } as any);
    expect(result.success).toBe(true);
  });

  it('update returns item', async () => {
    const result = await service.update('s1', { name: 'Updated' } as any);
    expect(result.success).toBe(true);
  });

  it('remove deletes item', async () => {
    const result = await service.remove('s1');
    expect(result.success).toBe(true);
  });
});
