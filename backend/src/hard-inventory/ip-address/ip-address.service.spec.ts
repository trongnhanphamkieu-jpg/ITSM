import { Test, TestingModule } from '@nestjs/testing';
import { IpAddressService } from './ip-address.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockItem = { id: 'item1', createdAt: new Date() };

describe('IpAddressService', () => {
  let service: IpAddressService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      ipAddress: {
        findMany: jest.fn().mockResolvedValue([mockItem]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockItem),
        update: jest.fn().mockResolvedValue(mockItem),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [IpAddressService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<IpAddressService>(IpAddressService);
  });

  it('findAll returns paginated list', async () => {
    const result = await service.findAll({});
    expect(result.success).toBe(true);
  });

  it('findOne returns item', async () => {
    prisma.ipAddress.findFirst.mockResolvedValue(mockItem);
    const result = await service.findOne('item1');
    expect(result.success).toBe(true);
  });

  it('findOne returns not found', async () => {
    prisma.ipAddress.findFirst.mockResolvedValue(null);
    const result = await service.findOne('x');
    expect(result.success).toBe(false);
  });

  it('create returns item', async () => {
    const result = await service.create({} as any, 'u1');
    expect(result.success).toBe(true);
  });

  it('update returns item', async () => {
    prisma.ipAddress.findFirst.mockResolvedValue(mockItem);
    const result = await service.update('item1', {} as any);
    expect(result.success).toBe(true);
  });

  it('remove soft-deletes', async () => {
    prisma.ipAddress.findFirst.mockResolvedValue(mockItem);
    const result = await service.remove('item1');
    expect(result.success).toBe(true);
  });
});
