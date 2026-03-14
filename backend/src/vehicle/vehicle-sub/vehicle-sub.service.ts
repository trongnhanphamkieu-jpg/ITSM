import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehicleSubService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; type?: string; vendorId?: string; page?: number; limit?: number }) {
    const { search, status, type, vendorId, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (type) where.type = type;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { name: true } },
          _count: { select: { subscriptions: { where: { isActive: true } } } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return { success: true, data, meta: { total, page, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        vendor: { select: { name: true } },
        subscriptions: {
          where: { isActive: true },
          include: { service: { select: { name: true, costType: true, frequency: true } } },
          orderBy: { createdAt: 'desc' },
        },
        variableCosts: {
          include: { service: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });

    let monthlyTotal = 0;
    if (vehicle?.subscriptions) {
      monthlyTotal = vehicle.subscriptions.reduce((sum, sub) => sum + Number(sub.monthlyCost), 0);
    }

    return { success: true, data: vehicle, monthlyTotal };
  }

  async create(data: any, userId: string) {
    const record = await this.prisma.vehicle.create({ data: { ...data, createdById: userId } });
    return { success: true, data: record };
  }

  async update(id: string, data: any) {
    const record = await this.prisma.vehicle.update({ where: { id }, data });
    return { success: true, data: record };
  }

  async remove(id: string) {
    await this.prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async costSummary(id: string) {
    const [subs, varCosts] = await Promise.all([
      this.prisma.vehicleServiceSubscription.findMany({ where: { vehicleId: id, isActive: true }, include: { service: { select: { name: true } } } }),
      this.prisma.vehicleVariableCost.aggregate({ where: { vehicleId: id }, _sum: { amount: true }, _count: true }),
    ]);
    const fixedMonthly = subs.reduce((s, sub) => s + Number(sub.monthlyCost), 0);
    return {
      success: true,
      data: {
        fixedMonthly,
        activeSubscriptions: subs.length,
        subscriptions: subs.map((s) => ({ id: s.id, service: s.service.name, monthlyCost: Number(s.monthlyCost) })),
        variableTotal: Number(varCosts._sum.amount || 0),
        variableCount: varCosts._count,
      },
    };
  }
}
