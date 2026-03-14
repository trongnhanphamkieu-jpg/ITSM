import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActualCostDto, UpdateActualCostDto } from './dto/cost.dto';

@Injectable()
export class CostService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryName?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { vendor: { contains: query.search, mode: 'insensitive' } },
        { invoiceNo: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryName) {
      where.categoryName = query.categoryName;
    }

    if (query.dateFrom || query.dateTo) {
      where.costDate = {};
      if (query.dateFrom) {
        (where.costDate as Record<string, unknown>).gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        (where.costDate as Record<string, unknown>).lte = new Date(query.dateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.actualCost.findMany({
        where,
        include: {
          budgetItem: {
            select: { id: true, name: true, category: { select: { name: true } } },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { costDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.actualCost.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cost = await this.prisma.actualCost.findUnique({
      where: { id },
      include: {
        budgetItem: {
          select: {
            id: true,
            name: true,
            totalPrice: true,
            category: { select: { name: true, plan: { select: { code: true, name: true } } } },
          },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!cost) throw new NotFoundException('Chi phí không tồn tại');

    return { success: true, data: cost };
  }

  async create(dto: CreateActualCostDto, userId: string) {
    const cost = await this.prisma.actualCost.create({
      data: {
        ...dto,
        amount: dto.amount,
        costDate: new Date(dto.costDate),
        createdById: userId,
      },
      include: {
        budgetItem: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return { success: true, data: cost };
  }

  async update(id: string, dto: UpdateActualCostDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.costDate) {
      updateData.costDate = new Date(dto.costDate);
    }

    const cost = await this.prisma.actualCost.update({
      where: { id },
      data: updateData,
      include: {
        budgetItem: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return { success: true, data: cost };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.actualCost.delete({ where: { id } });
    return { success: true, message: 'Đã xóa chi phí' };
  }

  async getCategories() {
    const categories = await this.prisma.actualCost.findMany({
      select: { categoryName: true },
      distinct: ['categoryName'],
      orderBy: { categoryName: 'asc' },
    });
    return {
      success: true,
      data: categories.map((c) => c.categoryName),
    };
  }

  async getSummary() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const [totalSpent, monthlyCosts] = await Promise.all([
      this.prisma.actualCost.aggregate({
        _sum: { amount: true },
        where: { costDate: { gte: startOfYear } },
      }),
      this.prisma.$queryRawUnsafe<{ month: number; total: string }[]>(
        `SELECT EXTRACT(MONTH FROM cost_date)::int as month, SUM(amount)::text as total
         FROM actual_costs
         WHERE cost_date >= $1
         GROUP BY month ORDER BY month`,
        startOfYear,
      ),
    ]);

    return {
      success: true,
      data: {
        totalSpent: totalSpent._sum.amount || 0,
        monthlyCosts,
      },
    };
  }
}
