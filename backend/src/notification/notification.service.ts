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
    type: 'contract_expiry' | 'budget_approval' | 'payment_overdue' | 'system';
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

  async checkPaymentOverdue() {
    const overdueCosts = await this.prisma.actualCost.findMany({
      where: {
        paymentDueDate: { lt: new Date() },
        paymentStatus: { in: ['pending', 'partial_paid'] },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        paymentDueDate: true,
        paymentStatus: true,
      },
    });

    // Notify admin + finance users
    const recipients = await this.prisma.user.findMany({
      where: {
        status: 'active',
        role: { in: ['admin', 'finance', 'manager'] },
      },
      select: { id: true },
    });

    let notified = 0;
    for (const cost of overdueCosts) {
      const daysOverdue = Math.ceil(
        (Date.now() - (cost.paymentDueDate?.getTime() || 0)) / (24 * 60 * 60 * 1000),
      );

      for (const user of recipients) {
        // Avoid duplicate: check if notified in last 24h
        const exists = await this.prisma.notification.findFirst({
          where: {
            userId: user.id,
            entityType: 'actual_cost',
            entityId: cost.id,
            type: 'payment_overdue',
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        });

        if (!exists) {
          await this.createNotification({
            userId: user.id,
            type: 'payment_overdue',
            title: `Chi phí quá hạn thanh toán (${daysOverdue} ngày)`,
            message: `"${cost.description}" — ${Number(cost.amount).toLocaleString('vi-VN')}đ — quá hạn ${daysOverdue} ngày.`,
            entityType: 'actual_cost',
            entityId: cost.id,
          });
          notified++;
        }
      }
    }

    return { overdue: overdueCosts.length, notified };
  }
}
