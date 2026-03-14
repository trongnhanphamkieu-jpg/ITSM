import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    module?: string;
    action?: string;
    from?: string;
    to?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = {};

    if (query.userId) where.userId = query.userId;
    if (query.module) where.module = query.module;
    if (query.action) where.action = query.action;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.search) {
      where.OR = [
        { module: { contains: query.search, mode: 'insensitive' } },
        { action: { contains: query.search, mode: 'insensitive' } },
        { entityType: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyHistory(userId: string, query: { page?: number; limit?: number }) {
    return this.findAll({ ...query, userId });
  }

  async getStats(query: { from?: string; to?: string }) {
    const where: any = {};
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [totalLogs, byModule, byAction, recentUsers] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ['module'],
        where,
        _count: true,
        orderBy: { _count: { module: 'desc' } },
        take: 10,
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
      }),
      this.prisma.auditLog.findMany({
        where,
        select: { userId: true, user: { select: { fullName: true } } },
        distinct: ['userId'],
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      byModule: byModule.map((m) => ({ module: m.module, count: m._count })),
      byAction: byAction.map((a) => ({ action: a.action, count: a._count })),
      recentUsers: recentUsers.map((u) => ({ userId: u.userId, fullName: u.user.fullName })),
    };
  }

  async getModules() {
    const modules = await this.prisma.auditLog.groupBy({ by: ['module'], _count: true, orderBy: { _count: { module: 'desc' } } });
    return modules.map((m) => m.module);
  }

  async createLog(data: {
    userId: string;
    module: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
