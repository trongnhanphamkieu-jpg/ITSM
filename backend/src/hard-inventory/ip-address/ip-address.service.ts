import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IpAddressService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; vlan?: string; ipType?: string; page?: number; limit?: number }) {
    const { search, status, vlan, ipType, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { address: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (vlan) where.vlan = vlan;
    if (ipType) where.ipType = ipType;

    const [data, total] = await Promise.all([
      this.prisma.ipAddress.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ipAddress.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.ipAddress.findFirst({ where: { id, deletedAt: null } });
    if (!item) return { success: false, message: 'Not found' };
    return { success: true, data: item };
  }

  async create(dto: any, userId: string) {
    const data = await this.prisma.ipAddress.create({ data: { ...dto, createdById: userId } });
    return { success: true, data };
  }

  async update(id: string, dto: any) {
    const data = await this.prisma.ipAddress.update({ where: { id }, data: dto });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.ipAddress.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Deleted' };
  }
}
