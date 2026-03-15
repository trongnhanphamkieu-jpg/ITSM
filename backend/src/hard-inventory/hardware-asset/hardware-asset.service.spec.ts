import { Test, TestingModule } from '@nestjs/testing';
import { HardwareAssetService } from './hardware-asset.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockItem = { id: 'item1', name: 'Dell Server', createdAt: new Date() };

describe('HardwareAssetService', () => {
  let service: HardwareAssetService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      hardwareAsset: {
        findMany: jest.fn().mockResolvedValue([mockItem]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockItem),
        update: jest.fn().mockResolvedValue(mockItem),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [HardwareAssetService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<HardwareAssetService>(HardwareAssetService);
  });

  it('findAll returns paginated list', async () => {
    const result = await service.findAll({});
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('findOne returns item', async () => {
    prisma.hardwareAsset.findFirst.mockResolvedValue(mockItem);
    const result = await service.findOne('item1');
    expect(result.success).toBe(true);
  });

  it('findOne returns not found', async () => {
    prisma.hardwareAsset.findFirst.mockResolvedValue(null);
    const result = await service.findOne('x');
    expect(result.success).toBe(false);
  });

  it('create returns item', async () => {
    const result = await service.create({} as any, 'u1');
    expect(result.success).toBe(true);
  });

  it('update returns item', async () => {
    prisma.hardwareAsset.findFirst.mockResolvedValue(mockItem);
    const result = await service.update('item1', {} as any);
    expect(result.success).toBe(true);
  });

  it('remove soft-deletes item', async () => {
    prisma.hardwareAsset.findFirst.mockResolvedValue(mockItem);
    const result = await service.remove('item1');
    expect(result.success).toBe(true);
  });
});
