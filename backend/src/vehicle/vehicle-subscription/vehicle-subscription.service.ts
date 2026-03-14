import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehicleSubscriptionService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { vehicleId?: string; serviceId?: string; isActive?: string; page?: number; limit?: number }) {
    const { vehicleId, serviceId, isActive, page = 1, limit = 20 } = query;
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (serviceId) where.serviceId = serviceId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      this.prisma.vehicleServiceSubscription.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true, costType: true, frequency: true } },
          vehicle: { select: { licensePlate: true, brand: true, model: true } },
        },
      }),
      this.prisma.vehicleServiceSubscription.count({ where }),
    ]);
    return { success: true, data, meta: { total, page, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return {
      success: true,
      data: await this.prisma.vehicleServiceSubscription.findUnique({
        where: { id },
        include: { service: true, vehicle: { select: { licensePlate: true, brand: true, model: true } } },
      }),
    };
  }

  async create(data: any, userId: string) {
    const record = await this.prisma.vehicleServiceSubscription.create({
      data: {
        vehicleId: data.vehicleId,
        serviceId: data.serviceId,
        monthlyCost: parseFloat(data.monthlyCost),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive ?? true,
        notes: data.notes || null,
        createdById: userId,
      },
      include: { service: { select: { name: true } } },
    });
    return { success: true, data: record };
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.monthlyCost !== undefined) updateData.monthlyCost = parseFloat(data.monthlyCost);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const record = await this.prisma.vehicleServiceSubscription.update({ where: { id }, data: updateData });
    return { success: true, data: record };
  }

  async deactivate(id: string) {
    const record = await this.prisma.vehicleServiceSubscription.update({
      where: { id },
      data: { isActive: false, endDate: new Date() },
    });
    return { success: true, data: record };
  }
}
