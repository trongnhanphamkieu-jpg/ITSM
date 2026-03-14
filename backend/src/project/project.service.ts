import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
    if (!project) throw new NotFoundException('Dự án không tồn tại');
    return project;
  }

  async create(data: any, userId: string) {
    return this.prisma.project.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        department: data.department,
        status: data.status || 'active',
        notes: data.notes,
        createdById: userId,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        department: data.department,
        status: data.status,
        notes: data.notes,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }

  // ── Budget Items for Project ──

  async getBudgetItems(projectId: string) {
    await this.findOne(projectId);
    return this.prisma.budgetItem.findMany({
      where: { projectId },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addBudgetItem(projectId: string, data: any) {
    await this.findOne(projectId);

    // Find or create a default budget category for direct project items
    let category = await this.prisma.budgetCategory.findFirst({
      where: {
        name: data.categoryName || 'Chi phí dự án',
        plan: { status: 'approved' },
      },
    });

    if (!category) {
      // Create a draft plan & category for project budget items
      const plan = await this.prisma.budgetPlan.findFirst({
        where: { status: 'draft' },
        orderBy: { createdAt: 'desc' },
      });

      if (plan) {
        category = await this.prisma.budgetCategory.create({
          data: {
            planId: plan.id,
            name: data.categoryName || 'Chi phí dự án',
          },
        });
      } else {
        throw new NotFoundException('Chưa có kế hoạch ngân sách nào. Vui lòng tạo kế hoạch trước.');
      }
    }

    const quantity = data.quantity || 1;
    const unitPrice = data.unitPrice || 0;
    const totalPrice = quantity * unitPrice;

    return this.prisma.budgetItem.create({
      data: {
        categoryId: category.id,
        projectId,
        name: data.name,
        description: data.description,
        unit: data.unit,
        quantity,
        unitPrice,
        totalPrice,
        note: data.note,
      },
    });
  }

  async removeBudgetItem(projectId: string, itemId: string) {
    const item = await this.prisma.budgetItem.findFirst({
      where: { id: itemId, projectId },
    });
    if (!item) throw new NotFoundException('Hạng mục không tồn tại trong dự án');
    return this.prisma.budgetItem.delete({ where: { id: itemId } });
  }

  // ── Actual Costs for Project ──

  async getActualCosts(projectId: string) {
    await this.findOne(projectId);
    return this.prisma.actualCost.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        budgetItem: { select: { id: true, name: true } },
      },
      orderBy: { costDate: 'desc' },
    });
  }

  async addActualCost(projectId: string, data: any, userId: string) {
    await this.findOne(projectId);
    return this.prisma.actualCost.create({
      data: {
        projectId,
        categoryName: data.categoryName || 'Chi phí dự án',
        description: data.description,
        amount: data.amount,
        costDate: new Date(data.costDate),
        vendor: data.vendor,
        invoiceNo: data.invoiceNo,
        note: data.note,
        budgetItemId: data.budgetItemId || null,
        createdById: userId,
      },
    });
  }

  async removeActualCost(projectId: string, costId: string) {
    const cost = await this.prisma.actualCost.findFirst({
      where: { id: costId, projectId },
    });
    if (!cost) throw new NotFoundException('Chi phí không tồn tại trong dự án');
    return this.prisma.actualCost.delete({ where: { id: costId } });
  }

  // ── Budget Summary ──

  async budgetSummary(id: string) {
    const project = await this.findOne(id);

    const budgetItems = await this.prisma.budgetItem.findMany({
      where: { projectId: id },
      select: { totalPrice: true },
    });

    const actualCosts = await this.prisma.actualCost.findMany({
      where: { projectId: id },
      select: { amount: true },
    });

    const plannedBudget = budgetItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    const actualCost = actualCosts.reduce(
      (sum, cost) => sum + Number(cost.amount),
      0,
    );

    return {
      project,
      plannedBudget,
      actualCost,
      remaining: plannedBudget - actualCost,
      usagePercent: plannedBudget > 0
        ? Math.round((actualCost / plannedBudget) * 10000) / 100
        : 0,
    };
  }

  async budgetOverview() {
    const projects = await this.prisma.project.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(
      projects.map(async (p) => {
        const summary = await this.budgetSummary(p.id);
        return {
          id: p.id,
          code: p.code,
          name: p.name,
          department: p.department,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          plannedBudget: summary.plannedBudget,
          actualCost: summary.actualCost,
          remaining: summary.remaining,
          usagePercent: summary.usagePercent,
        };
      }),
    );

    const totals = result.reduce(
      (acc, r) => ({
        plannedBudget: acc.plannedBudget + r.plannedBudget,
        actualCost: acc.actualCost + r.actualCost,
        remaining: acc.remaining + r.remaining,
      }),
      { plannedBudget: 0, actualCost: 0, remaining: 0 },
    );

    return {
      projects: result,
      totals: {
        ...totals,
        usagePercent: totals.plannedBudget > 0
          ? Math.round((totals.actualCost / totals.plannedBudget) * 10000) / 100
          : 0,
      },
    };
  }
}
