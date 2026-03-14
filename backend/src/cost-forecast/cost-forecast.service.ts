import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CostForecastService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { year?: string; status?: string }) {
    const where: any = {};
    if (query.year) where.year = Number(query.year);
    if (query.status) where.status = query.status;
    return this.prisma.costForecast.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        createdBy: { select: { id: true, fullName: true } },
        approvedBy: { select: { id: true, fullName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async findOne(id: string) {
    const forecast = await this.prisma.costForecast.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        approvedBy: { select: { id: true, fullName: true } },
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            project: { select: { id: true, code: true, name: true } },
            createdBy: { select: { id: true, fullName: true } },
          },
        },
        history: {
          orderBy: { performedAt: 'desc' },
          include: {
            performedBy: { select: { id: true, fullName: true } },
          },
        },
      },
    });
    if (!forecast) throw new NotFoundException('Bảng dự chi không tồn tại');
    return forecast;
  }

  async create(data: any, userId: string) {
    const existing = await this.prisma.costForecast.findFirst({
      where: { year: data.year, month: data.month },
    });
    if (existing) throw new BadRequestException(`Đã tồn tại bảng dự chi tháng ${data.month}/${data.year}`);

    const forecast = await this.prisma.costForecast.create({
      data: {
        year: data.year,
        month: data.month,
        name: data.name || `Dự chi tháng ${data.month}/${data.year}`,
        notes: data.notes,
        createdById: userId,
      },
    });

    await this.prisma.costForecastHistory.create({
      data: {
        forecastId: forecast.id,
        action: 'create',
        comment: 'Tạo bảng dự chi mới',
        performedById: userId,
      },
    });

    // Create items if provided
    if (data.items?.length) {
      for (const item of data.items) {
        await this.addItem(forecast.id, item, userId);
      }
      await this.recalcTotal(forecast.id);
    }

    return this.findOne(forecast.id);
  }

  async update(id: string, data: any) {
    const forecast = await this.findOne(id);
    if (forecast.status !== 'draft') {
      throw new BadRequestException('Chỉ có thể sửa bảng dự chi ở trạng thái nháp');
    }
    return this.prisma.costForecast.update({
      where: { id },
      data: {
        name: data.name,
        notes: data.notes,
      },
    });
  }

  async remove(id: string) {
    const forecast = await this.findOne(id);
    if (forecast.status !== 'draft') {
      throw new BadRequestException('Chỉ có thể xóa bảng dự chi ở trạng thái nháp');
    }
    return this.prisma.costForecast.delete({ where: { id } });
  }

  // ── Items ──

  async addItem(forecastId: string, data: any, userId: string) {
    const forecast = await this.prisma.costForecast.findUnique({ where: { id: forecastId } });
    if (!forecast) throw new NotFoundException('Bảng dự chi không tồn tại');
    if (forecast.status !== 'draft') throw new BadRequestException('Chỉ thêm được khi ở trạng thái nháp');

    const item = await this.prisma.costForecastItem.create({
      data: {
        forecastId,
        itemName: data.itemName,
        description: data.description,
        estimatedAmount: data.estimatedAmount,
        vendor: data.vendor,
        projectId: data.projectId || null,
        priority: data.priority || 'medium',
        notes: data.notes,
        createdById: userId,
      },
    });

    await this.recalcTotal(forecastId);
    return item;
  }

  async removeItem(forecastId: string, itemId: string) {
    const forecast = await this.prisma.costForecast.findUnique({ where: { id: forecastId } });
    if (!forecast) throw new NotFoundException('Bảng dự chi không tồn tại');
    if (forecast.status !== 'draft') throw new BadRequestException('Chỉ xóa được khi ở trạng thái nháp');

    const item = await this.prisma.costForecastItem.findFirst({
      where: { id: itemId, forecastId },
    });
    if (!item) throw new NotFoundException('Hạng mục không tồn tại');

    await this.prisma.costForecastItem.delete({ where: { id: itemId } });
    await this.recalcTotal(forecastId);
  }

  // ── Approval Workflow ──

  async submit(id: string, userId: string) {
    const forecast = await this.findOne(id);
    if (forecast.status !== 'draft') throw new BadRequestException('Chỉ gửi từ trạng thái nháp');
    if (forecast.items.length === 0) throw new BadRequestException('Cần ít nhất 1 hạng mục');

    await this.prisma.costForecast.update({
      where: { id },
      data: { status: 'pending' },
    });

    await this.prisma.costForecastHistory.create({
      data: {
        forecastId: id,
        action: 'submit',
        comment: 'Gửi phê duyệt',
        performedById: userId,
      },
    });

    return this.findOne(id);
  }

  async approve(id: string, userId: string, comment?: string) {
    const forecast = await this.findOne(id);
    if (forecast.status !== 'pending') throw new BadRequestException('Chỉ phê duyệt từ trạng thái chờ');

    await this.prisma.costForecast.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: userId,
        approvedAt: new Date(),
      },
    });

    await this.prisma.costForecastHistory.create({
      data: {
        forecastId: id,
        action: 'approve',
        comment: comment || 'Đã phê duyệt',
        performedById: userId,
      },
    });

    return this.findOne(id);
  }

  async reject(id: string, userId: string, reason: string) {
    const forecast = await this.findOne(id);
    if (forecast.status !== 'pending') throw new BadRequestException('Chỉ từ chối từ trạng thái chờ');

    await this.prisma.costForecast.update({
      where: { id },
      data: { status: 'rejected', rejectReason: reason },
    });

    await this.prisma.costForecastHistory.create({
      data: {
        forecastId: id,
        action: 'reject',
        comment: reason,
        performedById: userId,
      },
    });

    return this.findOne(id);
  }

  // ── Clone ──

  async clone(id: string, userId: string) {
    const source = await this.findOne(id);
    let nextMonth = source.month + 1;
    let nextYear = source.year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }

    const existing = await this.prisma.costForecast.findFirst({
      where: { year: nextYear, month: nextMonth },
    });
    if (existing) throw new BadRequestException(`Đã tồn tại bảng dự chi tháng ${nextMonth}/${nextYear}`);

    const newForecast = await this.prisma.costForecast.create({
      data: {
        year: nextYear,
        month: nextMonth,
        name: `Dự chi tháng ${nextMonth}/${nextYear}`,
        createdById: userId,
      },
    });

    // Clone items
    for (const item of source.items) {
      await this.prisma.costForecastItem.create({
        data: {
          forecastId: newForecast.id,
          itemName: item.itemName,
          description: item.description,
          estimatedAmount: item.estimatedAmount,
          vendor: item.vendor,
          projectId: item.projectId,
          priority: item.priority,
          notes: item.notes,
          sortOrder: item.sortOrder,
          createdById: userId,
        },
      });
    }

    await this.recalcTotal(newForecast.id);

    await this.prisma.costForecastHistory.create({
      data: {
        forecastId: newForecast.id,
        action: 'create',
        comment: `Clone từ dự chi tháng ${source.month}/${source.year}`,
        performedById: userId,
      },
    });

    return this.findOne(newForecast.id);
  }

  // ── Reports ──

  async yearlySummary(year: number) {
    const forecasts = await this.prisma.costForecast.findMany({
      where: { year },
      orderBy: { month: 'asc' },
      include: {
        items: { select: { estimatedAmount: true } },
      },
    });

    const months = Array.from({ length: 12 }, (_, i) => {
      const found = forecasts.find((f) => f.month === i + 1);
      return {
        month: i + 1,
        name: `Tháng ${i + 1}`,
        status: found?.status || null,
        forecastTotal: found
          ? found.items.reduce((sum, item) => sum + Number(item.estimatedAmount), 0)
          : 0,
        forecastId: found?.id || null,
      };
    });

    // Get actual costs per month
    const actualCosts = await this.prisma.actualCost.findMany({
      where: {
        costDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      select: { amount: true, costDate: true },
    });

    const actualByMonth: Record<number, number> = {};
    for (const cost of actualCosts) {
      const month = new Date(cost.costDate).getMonth() + 1;
      actualByMonth[month] = (actualByMonth[month] || 0) + Number(cost.amount);
    }

    return months.map((m) => ({
      ...m,
      actualTotal: actualByMonth[m.month] || 0,
      variance: m.forecastTotal - (actualByMonth[m.month] || 0),
      accuracyPct: m.forecastTotal > 0
        ? Math.round(((actualByMonth[m.month] || 0) / m.forecastTotal) * 10000) / 100
        : 0,
    }));
  }

  async vsActual(forecastId: string) {
    const forecast = await this.findOne(forecastId);
    const startDate = new Date(`${forecast.year}-${String(forecast.month).padStart(2, '0')}-01`);
    const endMonth = forecast.month === 12 ? 1 : forecast.month + 1;
    const endYear = forecast.month === 12 ? forecast.year + 1 : forecast.year;
    const endDate = new Date(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);

    const actualCosts = await this.prisma.actualCost.findMany({
      where: {
        costDate: { gte: startDate, lt: endDate },
      },
      select: { categoryName: true, amount: true, description: true },
    });

    const actualTotal = actualCosts.reduce((sum, c) => sum + Number(c.amount), 0);
    const forecastTotal = forecast.items.reduce((sum, i) => sum + Number(i.estimatedAmount), 0);

    return {
      forecastId: forecast.id,
      month: forecast.month,
      year: forecast.year,
      forecastTotal,
      actualTotal,
      variance: forecastTotal - actualTotal,
      accuracyPct: forecastTotal > 0
        ? Math.round((actualTotal / forecastTotal) * 10000) / 100
        : 0,
      items: forecast.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        estimatedAmount: Number(item.estimatedAmount),
        priority: item.priority,
      })),
      actualCosts: actualCosts.map((c) => ({
        categoryName: c.categoryName,
        amount: Number(c.amount),
        description: c.description,
      })),
    };
  }

  // ── Helper ──

  private async recalcTotal(forecastId: string) {
    const items = await this.prisma.costForecastItem.findMany({
      where: { forecastId },
      select: { estimatedAmount: true },
    });
    const total = items.reduce((sum, i) => sum + Number(i.estimatedAmount), 0);
    await this.prisma.costForecast.update({
      where: { id: forecastId },
      data: { totalAmount: total },
    });
  }
}
