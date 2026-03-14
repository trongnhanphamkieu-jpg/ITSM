import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HardwareAssetService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; vendorId?: string; category?: string; page?: number; limit?: number }) {
    const { search, status, vendorId, category, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      this.prisma.hardwareAsset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hardwareAsset.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.hardwareAsset.findFirst({ where: { id, deletedAt: null } });
    if (!item) return { success: false, message: 'Not found' };
    return { success: true, data: item };
  }

  async create(dto: any, userId: string) {
    const data = await this.prisma.hardwareAsset.create({ data: { ...dto, createdById: userId } });
    return { success: true, data };
  }

  async update(id: string, dto: any) {
    const data = await this.prisma.hardwareAsset.update({ where: { id }, data: dto });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.hardwareAsset.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Deleted' };
  }
}
