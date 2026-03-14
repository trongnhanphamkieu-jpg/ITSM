import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehicleSvcService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; costType?: string; frequency?: string; page?: number; limit?: number }) {
    const { search, costType, frequency, page = 1, limit = 20 } = query;
    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (costType) where.costType = costType;
    if (frequency) where.frequency = frequency;

    const [data, total] = await Promise.all([
      this.prisma.vehicleService.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.vehicleService.count({ where }),
    ]);
    return { success: true, data, meta: { total, page, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return { success: true, data: await this.prisma.vehicleService.findUnique({ where: { id } }) };
  }

  async create(data: any) {
    const record = await this.prisma.vehicleService.create({
      data: {
        name: data.name,
        description: data.description || null,
        costType: data.costType || 'fixed',
        frequency: data.frequency || 'monthly',
        defaultCost: data.defaultCost ? parseFloat(data.defaultCost) : null,
        isActive: data.isActive ?? true,
      },
    });
    return { success: true, data: record };
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.costType !== undefined) updateData.costType = data.costType;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.defaultCost !== undefined) updateData.defaultCost = data.defaultCost ? parseFloat(data.defaultCost) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const record = await this.prisma.vehicleService.update({ where: { id }, data: updateData });
    return { success: true, data: record };
  }

  async remove(id: string) {
    await this.prisma.vehicleService.delete({ where: { id } });
    return { success: true };
  }
}
