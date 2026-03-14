import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      success: true,
      data,
      meta: { total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { success: true, data: { unreadCount: count } };
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { success: true, message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, message: 'All marked as read' };
  }

  async createNotification(data: {
    userId: string;
    type: 'contract_expiry' | 'budget_approval' | 'system';
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async checkContractExpiry() {
    const contracts = await this.prisma.contract.findMany({
      where: {
        status: 'active',
        endDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: { vendor: { select: { name: true } } },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'admin', status: 'active' },
      select: { id: true },
    });

    for (const contract of contracts) {
      const daysLeft = Math.ceil(
        (contract.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
      );

      for (const admin of admins) {
        const existing = await this.prisma.notification.findFirst({
          where: {
            userId: admin.id,
            entityType: 'contract',
            entityId: contract.id,
            type: 'contract_expiry',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });

        if (!existing) {
          await this.createNotification({
            userId: admin.id,
            type: 'contract_expiry',
            title: `Hợp đồng sắp hết hạn: ${contract.code}`,
            message: `Hợp đồng "${contract.name}" với ${contract.vendor.name} sẽ hết hạn trong ${daysLeft} ngày.`,
            entityType: 'contract',
            entityId: contract.id,
          });
        }
      }
    }

    return { checked: contracts.length, notified: admins.length };
  }
}
