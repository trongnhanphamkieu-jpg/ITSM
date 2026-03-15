import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getSummary(year?: number, month?: number, quarter?: number) {
    const targetYear = year || new Date().getFullYear();
    const cacheKey = `dashboard:summary:${targetYear}:${month || 0}:${quarter || 0}`;

    return this.cache.wrap(cacheKey, async () => {

    // Calculate date range based on filters
    let startDate: Date;
    let endDate: Date;

    if (month) {
      startDate = new Date(targetYear, month - 1, 1);
      endDate = new Date(targetYear, month, 0, 23, 59, 59);
    } else if (quarter) {
      const qStartMonth = (quarter - 1) * 3;
      startDate = new Date(targetYear, qStartMonth, 1);
      endDate = new Date(targetYear, qStartMonth + 3, 0, 23, 59, 59);
    } else {
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    }

    const [
      budgetAgg,
      costAgg,
      planCount,
      pendingCount,
      recentActivity,
      budgetByCategory,
      costByCategory,
    ] = await Promise.all([
      // Total budget (approved plans for target year)
      this.prisma.budgetPlan.aggregate({
        _sum: { totalAmount: true },
        where: { year: targetYear, status: 'approved' },
      }),

      // Total spent (costs in date range)
      this.prisma.actualCost.aggregate({
        _sum: { amount: true },
        where: { costDate: { gte: startDate, lte: endDate } },
      }),

      // Plan counts for target year
      this.prisma.budgetPlan.count({ where: { year: targetYear } }),

      // Pending approval (always current)
      this.prisma.budgetPlan.count({ where: { status: 'pending' } }),

      // Recent activity from audit logs
      this.prisma.auditLog.findMany({
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Budget by category (from approved plans for target year)
      this.prisma.$queryRaw<{ name: string; total: string }[]>`
        SELECT bc.name, SUM(bi.total_price)::text as total
         FROM budget_categories bc
         JOIN budget_items bi ON bi.category_id = bc.id
         JOIN budget_plans bp ON bp.id = bc.plan_id
         WHERE bp.year = ${targetYear} AND bp.status = 'approved'
         GROUP BY bc.name ORDER BY total DESC LIMIT 8
      `,

      // Cost by category (in date range)
      this.prisma.$queryRaw<{ name: string; total: string }[]>`
        SELECT category_name as name, SUM(amount)::text as total
         FROM actual_costs
         WHERE cost_date >= ${startDate} AND cost_date <= ${endDate}
         AND deleted_at IS NULL
         GROUP BY category_name ORDER BY total DESC LIMIT 8
      `,
    ]);

    const totalBudget = Number(budgetAgg._sum.totalAmount || 0);
    const totalSpent = Number(costAgg._sum.amount || 0);

    // Build budget vs actual chart data
    const categoryMap = new Map<string, { budget: number; actual: number }>();
    for (const bc of budgetByCategory) {
      categoryMap.set(bc.name, { budget: Number(bc.total), actual: 0 });
    }
    for (const cc of costByCategory) {
      const existing = categoryMap.get(cc.name);
      if (existing) {
        existing.actual = Number(cc.total);
      } else {
        categoryMap.set(cc.name, { budget: 0, actual: Number(cc.total) });
      }
    }

    const budgetVsActual = Array.from(categoryMap.entries()).map(
      ([category, values]) => ({
        category,
        budget: values.budget,
        actual: values.actual,
      }),
    );

    // Filter label for UI
    let filterLabel = `Năm ${targetYear}`;
    if (month) filterLabel = `Tháng ${month}/${targetYear}`;
    else if (quarter) filterLabel = `Quý ${quarter}/${targetYear}`;

    return {
      success: true,
      data: {
        totalBudget,
        totalSpent,
        spentPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0,
        planCount,
        pendingApproval: pendingCount,
        budgetVsActual,
        filterLabel,
        recentActivity: recentActivity.map((a) => ({
          id: a.id,
          user: a.user.fullName,
          action: `${a.action} ${a.entityType}`,
          module: a.module,
          time: a.createdAt,
        })),
      },
    };
    }, 30_000); // 30s TTL
  }
}
