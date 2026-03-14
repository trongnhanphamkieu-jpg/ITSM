import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehicleCostService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; vehicleId?: string; serviceId?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) {
    const { search, vehicleId, serviceId, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (serviceId) where.serviceId = serviceId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    if (search) where.notes = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.vehicleVariableCost.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' },
        include: { vehicle: { select: { licensePlate: true, brand: true, model: true } }, service: { select: { name: true } } },
      }),
      this.prisma.vehicleVariableCost.count({ where }),
    ]);
    return { success: true, data, meta: { total, page, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return { success: true, data: await this.prisma.vehicleVariableCost.findUnique({ where: { id }, include: { vehicle: { select: { licensePlate: true, brand: true } }, service: { select: { name: true } } } }) };
  }

  async create(data: any, userId: string) {
    const record = await this.prisma.vehicleVariableCost.create({
      data: { ...data, amount: parseFloat(data.amount), date: new Date(data.date), mileageAtService: data.mileageAtService ? parseInt(data.mileageAtService) : null, createdById: userId },
    });
    return { success: true, data: record };
  }

  async update(id: string, data: any) {
    if (data.amount) data.amount = parseFloat(data.amount);
    if (data.date) data.date = new Date(data.date);
    if (data.mileageAtService) data.mileageAtService = parseInt(data.mileageAtService);
    const record = await this.prisma.vehicleVariableCost.update({ where: { id }, data });
    return { success: true, data: record };
  }

  async remove(id: string) {
    await this.prisma.vehicleVariableCost.delete({ where: { id } });
    return { success: true };
  }

  async summary(query: { vehicleId?: string; dateFrom?: string; dateTo?: string }) {
    const { vehicleId, dateFrom, dateTo } = query;
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    const result = await this.prisma.vehicleVariableCost.aggregate({ where, _sum: { amount: true }, _count: true });
    return { success: true, data: { totalAmount: result._sum.amount || 0, totalRecords: result._count } };
  }
}
