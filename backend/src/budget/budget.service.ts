import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBudgetPlanDto,
  UpdateBudgetPlanDto,
} from './dto/budget.dto';
import { BudgetStatus } from '@prisma/client';

const PLAN_INCLUDE = {
  categories: {
    include: { items: { orderBy: { sortOrder: 'asc' as const } } },
    orderBy: { sortOrder: 'asc' as const },
  },
  createdBy: { select: { id: true, fullName: true, email: true } },
  approvedBy: { select: { id: true, fullName: true, email: true } },
};

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    year?: number,
    status?: BudgetStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (year) where.year = year;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.budgetPlan.findMany({
        where,
        include: {
          createdBy: { select: { id: true, fullName: true } },
          categories: {
            include: { _count: { select: { items: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.budgetPlan.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const plan = await this.prisma.budgetPlan.findUnique({
      where: { id },
      include: PLAN_INCLUDE,
    });
    if (!plan) throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    return { success: true, data: plan };
  }

  async create(dto: CreateBudgetPlanDto, userId: string) {
    const code = await this.generateCode(dto.year, dto.quarter);

    const plan = await this.prisma.budgetPlan.create({
      data: {
        code,
        name: dto.name,
        year: dto.year,
        quarter: dto.quarter,
        description: dto.description,
        createdById: userId,
        categories: {
          create: dto.categories.map((cat, ci) => ({
            name: cat.name,
            sortOrder: cat.sortOrder ?? ci,
            items: {
              create: cat.items.map((item, ii) => ({
                name: item.name,
                description: item.description,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                note: item.note,
                sortOrder: item.sortOrder ?? ii,
              })),
            },
          })),
        },
      },
      include: PLAN_INCLUDE,
    });

    // Recalculate total
    await this.recalcTotal(plan.id);

    return { success: true, data: await this.getById(plan.id) };
  }

  async update(id: string, dto: UpdateBudgetPlanDto) {
    const existing = await this.prisma.budgetPlan.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    if (existing.status !== 'draft')
      throw new BadRequestException(
        'Chỉ có thể sửa kế hoạch ở trạng thái Nháp',
      );

    // Update header fields
    await this.prisma.budgetPlan.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.year && { year: dto.year }),
        ...(dto.quarter !== undefined && { quarter: dto.quarter }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
    });

    // Replace categories+items if provided
    if (dto.categories) {
      await this.prisma.budgetCategory.deleteMany({
        where: { planId: id },
      });

      for (let ci = 0; ci < dto.categories.length; ci++) {
        const cat = dto.categories[ci];
        await this.prisma.budgetCategory.create({
          data: {
            planId: id,
            name: cat.name,
            sortOrder: cat.sortOrder ?? ci,
            items: {
              create: cat.items.map((item, ii) => ({
                name: item.name,
                description: item.description,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                note: item.note,
                sortOrder: item.sortOrder ?? ii,
              })),
            },
          },
        });
      }

      await this.recalcTotal(id);
    }

    return { success: true, data: await this.getById(id) };
  }

  async delete(id: string) {
    const existing = await this.prisma.budgetPlan.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    if (existing.status !== 'draft')
      throw new BadRequestException(
        'Chỉ có thể xóa kế hoạch ở trạng thái Nháp',
      );

    await this.prisma.budgetPlan.delete({ where: { id } });
    return { success: true, message: 'Đã xóa kế hoạch ngân sách' };
  }

  // ── Approval workflow ──

  async submitForApproval(id: string) {
    const plan = await this.prisma.budgetPlan.findUnique({
      where: { id },
    });
    if (!plan)
      throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    if (plan.status !== 'draft')
      throw new BadRequestException(
        'Chỉ có thể gửi duyệt kế hoạch ở trạng thái Nháp',
      );

    const updated = await this.prisma.budgetPlan.update({
      where: { id },
      data: { status: 'pending' },
      include: PLAN_INCLUDE,
    });

    return { success: true, data: updated };
  }

  async approve(id: string, userId: string) {
    const plan = await this.prisma.budgetPlan.findUnique({
      where: { id },
    });
    if (!plan)
      throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    if (plan.status !== 'pending')
      throw new BadRequestException(
        'Chỉ có thể duyệt kế hoạch đang chờ duyệt',
      );

    const updated = await this.prisma.budgetPlan.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: PLAN_INCLUDE,
    });

    return { success: true, data: updated };
  }

  async reject(id: string, userId: string, rejectionNote?: string) {
    const plan = await this.prisma.budgetPlan.findUnique({
      where: { id },
    });
    if (!plan)
      throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    if (plan.status !== 'pending')
      throw new BadRequestException(
        'Chỉ có thể từ chối kế hoạch đang chờ duyệt',
      );

    const updated = await this.prisma.budgetPlan.update({
      where: { id },
      data: {
        status: 'rejected',
        approvedById: userId,
        approvedAt: new Date(),
        rejectionNote,
      },
      include: PLAN_INCLUDE,
    });

    return { success: true, data: updated };
  }

  async revertToDraft(id: string) {
    const plan = await this.prisma.budgetPlan.findUnique({
      where: { id },
    });
    if (!plan)
      throw new NotFoundException('Kế hoạch ngân sách không tồn tại');
    if (plan.status === 'draft')
      throw new BadRequestException('Kế hoạch đã ở trạng thái Nháp');

    const updated = await this.prisma.budgetPlan.update({
      where: { id },
      data: {
        status: 'draft',
        approvedById: null,
        approvedAt: null,
        rejectionNote: null,
      },
      include: PLAN_INCLUDE,
    });

    return { success: true, data: updated };
  }

  // ── Helpers ──

  private async getById(id: string) {
    return this.prisma.budgetPlan.findUnique({
      where: { id },
      include: PLAN_INCLUDE,
    });
  }

  private async recalcTotal(planId: string) {
    const items = await this.prisma.budgetItem.findMany({
      where: { category: { planId } },
    });
    const total = items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    await this.prisma.budgetPlan.update({
      where: { id: planId },
      data: { totalAmount: total },
    });
  }

  private async generateCode(year: number, quarter?: number): Promise<string> {
    const prefix = quarter ? `NS${year}-Q${quarter}` : `NS${year}`;
    const count = await this.prisma.budgetPlan.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }
}
