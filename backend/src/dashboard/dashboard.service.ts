import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const [
      budgetAgg,
      costAgg,
      planCount,
      pendingCount,
      recentActivity,
      budgetByCategory,
      costByCategory,
    ] = await Promise.all([
      // Total budget (approved plans this year)
      this.prisma.budgetPlan.aggregate({
        _sum: { totalAmount: true },
        where: { year: currentYear, status: 'approved' },
      }),

      // Total spent (costs this year)
      this.prisma.actualCost.aggregate({
        _sum: { amount: true },
        where: { costDate: { gte: startOfYear } },
      }),

      // Plan counts
      this.prisma.budgetPlan.count({ where: { year: currentYear } }),

      // Pending approval
      this.prisma.budgetPlan.count({ where: { status: 'pending' } }),

      // Recent activity from audit logs
      this.prisma.auditLog.findMany({
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Budget by category (from approved plans)
      this.prisma.$queryRawUnsafe<{ name: string; total: string }[]>(
        `SELECT bc.name, SUM(bi.total_price)::text as total
         FROM budget_categories bc
         JOIN budget_items bi ON bi.category_id = bc.id
         JOIN budget_plans bp ON bp.id = bc.plan_id
         WHERE bp.year = $1 AND bp.status = 'approved'
         GROUP BY bc.name ORDER BY total DESC LIMIT 8`,
        currentYear,
      ),

      // Cost by category
      this.prisma.$queryRawUnsafe<{ name: string; total: string }[]>(
        `SELECT category_name as name, SUM(amount)::text as total
         FROM actual_costs
         WHERE cost_date >= $1
         GROUP BY category_name ORDER BY total DESC LIMIT 8`,
        startOfYear,
      ),
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

    return {
      success: true,
      data: {
        totalBudget,
        totalSpent,
        spentPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0,
        planCount,
        pendingApproval: pendingCount,
        budgetVsActual,
        recentActivity: recentActivity.map((a) => ({
          id: a.id,
          user: a.user.fullName,
          action: `${a.action} ${a.entityType}`,
          module: a.module,
          time: a.createdAt,
        })),
      },
    };
  }
}
