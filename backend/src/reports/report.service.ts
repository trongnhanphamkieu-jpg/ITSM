import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getBudgetSummary(year: number) {
    const plans = await this.prisma.budgetPlan.findMany({
      where: { year },
      include: {
        categories: { include: { items: true } },
        createdBy: { select: { fullName: true } },
      },
    });

    const costs = await this.prisma.actualCost.findMany({
      where: { costDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    });

    const totalBudget = plans.reduce(
      (sum, p) => sum + p.categories.reduce((cs, c) => cs + c.items.reduce((is, i) => is + Number(i.totalPrice), 0), 0),
      0,
    );
    const totalActual = costs.reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      year,
      totalBudget,
      totalActual,
      variance: totalBudget - totalActual,
      utilizationPct: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 10000) / 100 : 0,
      planCount: plans.length,
      costCount: costs.length,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        totalAmount: p.categories.reduce((cs, c) => cs + c.items.reduce((is, i) => is + Number(i.totalPrice), 0), 0),
        itemCount: p.categories.reduce((cs, c) => cs + c.items.length, 0),
        createdBy: p.createdBy.fullName,
      })),
    };
  }

  async getCostComparison(year: number) {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const from = new Date(year, m - 1, 1);
      const to = new Date(year, m, 1);

      const costs = await this.prisma.actualCost.findMany({
        where: { costDate: { gte: from, lt: to } },
      });

      const forecast = await this.prisma.costForecast.findFirst({
        where: { year, month: m },
        select: { totalAmount: true, status: true },
      });

      const totalCost = costs.reduce((sum, c) => sum + Number(c.amount), 0);
      const forecastAmount = forecast ? Number(forecast.totalAmount) : 0;

      months.push({
        month: m,
        name: `Tháng ${m}`,
        actualCost: totalCost,
        forecastAmount,
        variance: forecastAmount - totalCost,
        forecastStatus: forecast?.status || null,
      });
    }

    return { year, months };
  }

  async getAssetOverview() {
    const [
      hardwareCount,
      infraCount,
      ipCount,
      emailCount,
      domainCount,
      vpsCount,
      licenseCount,
      sslCount,
      vehicleCount,
    ] = await Promise.all([
      this.prisma.hardwareAsset.count().catch(() => 0),
      this.prisma.infraResource.count().catch(() => 0),
      this.prisma.ipAddress.count().catch(() => 0),
      this.prisma.emailAccount.count().catch(() => 0),
      this.prisma.domain.count().catch(() => 0),
      this.prisma.vpsServer.count().catch(() => 0),
      this.prisma.softwareLicense.count().catch(() => 0),
      this.prisma.sslCertificate.count().catch(() => 0),
      this.prisma.vehicle.count().catch(() => 0),
    ]);

    return {
      totalAssets: hardwareCount + infraCount + ipCount + emailCount +
                   domainCount + vpsCount + licenseCount + sslCount + vehicleCount,
      breakdown: [
        { category: 'Phần cứng', count: hardwareCount, icon: '🖥️' },
        { category: 'Hạ tầng', count: infraCount, icon: '🏗️' },
        { category: 'IP', count: ipCount, icon: '🌐' },
        { category: 'Email', count: emailCount, icon: '📧' },
        { category: 'Domain', count: domainCount, icon: '🌍' },
        { category: 'VPS', count: vpsCount, icon: '☁️' },
        { category: 'Phần mềm', count: licenseCount, icon: '💿' },
        { category: 'SSL', count: sslCount, icon: '🔒' },
        { category: 'Phương tiện', count: vehicleCount, icon: '🚗' },
      ],
    };
  }

  async getProjectBudgetReport(year?: number) {
    const projects = await this.prisma.project.findMany({
      include: {
        budgetItems: true,
        actualCosts: true,
        createdBy: { select: { fullName: true } },
      },
    });

    return projects.map((p) => {
      const totalBudget = p.budgetItems.reduce((s, i) => s + Number(i.totalPrice), 0);
      const totalActual = p.actualCosts
        .filter((c) => !year || new Date(c.costDate).getFullYear() === year)
        .reduce((s, c) => s + Number(c.amount), 0);

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        department: p.department,
        status: p.status,
        totalBudget,
        totalActual,
        variance: totalBudget - totalActual,
        utilizationPct: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 10000) / 100 : 0,
        budgetItemCount: p.budgetItems.length,
        actualCostCount: p.actualCosts.length,
        createdBy: p.createdBy.fullName,
      };
    });
  }
}
