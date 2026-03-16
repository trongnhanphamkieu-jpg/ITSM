import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 20 } = query;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { taxCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        include: {
          _count: { select: { contracts: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        contracts: {
          orderBy: { endDate: 'desc' },
          select: {
            id: true,
            code: true,
            name: true,
            startDate: true,
            endDate: true,
            value: true,
            status: true,
          },
        },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return { success: true, data: vendor };
  }

  async create(dto: CreateVendorDto, userId: string) {
    const code = await this.generateCode();
    const vendor = await this.prisma.vendor.create({
      data: { ...dto, code, createdById: userId },
    });
    return { success: true, data: vendor };
  }

  async update(id: string, dto: UpdateVendorDto) {
    await this.findOne(id);
    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: vendor };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.vendor.update({
      where: { id },
      data: { status: 'inactive' },
    });
    return { success: true, message: 'Vendor deactivated' };
  }

  private async generateCode(): Promise<string> {
    const count = await this.prisma.vendor.count();
    return `NCC-${String(count + 1).padStart(4, '0')}`;
  }

  // ── PAYABLES ───────────────────────────────────────────────

  async getPayables(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const costs = await this.prisma.actualCost.findMany({
      where: {
        vendorId,
        paymentStatus: { in: ['pending', 'partial_paid'] },
        deletedAt: null,
      },
      select: {
        id: true, description: true, categoryName: true, amount: true,
        paidAmount: true, paymentStatus: true, costDate: true,
        paymentDueDate: true, invoiceNo: true,
      },
      orderBy: { costDate: 'desc' },
    });

    const totalOutstanding = costs.reduce((sum, c) => {
      return sum + (Number(c.amount) - Number(c.paidAmount || 0));
    }, 0);

    return {
      success: true,
      data: { vendor: { id: vendor.id, name: vendor.name, code: vendor.code }, costs, totalOutstanding },
    };
  }

  async getPayablesSummary() {
    const vendors = await this.prisma.vendor.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, code: true },
    });

    const summary = await Promise.all(
      vendors.map(async (v) => {
        const agg = await this.prisma.actualCost.aggregate({
          where: { vendorId: v.id, paymentStatus: { in: ['pending', 'partial_paid'] as any }, deletedAt: null },
          _sum: { amount: true, paidAmount: true },
          _count: { _all: true },
        });
        const totalAmount = Number(agg._sum?.amount || 0);
        const totalPaid = Number(agg._sum?.paidAmount || 0);
        return { ...v, totalCosts: agg._count._all, totalAmount, totalPaid, outstanding: totalAmount - totalPaid };
      }),
    );

    const filtered = summary.filter((s) => s.totalCosts > 0);
    const grandTotal = filtered.reduce((s, v) => s + v.outstanding, 0);

    return { success: true, data: filtered, grandTotal };
  }

  // ── RECONCILIATION ─────────────────────────────────────────

  async createReconciliation(vendorId: string, userId: string) {
    const { data: payables } = await this.getPayables(vendorId);
    if (payables.costs.length === 0) {
      return { success: false, message: 'Không có công nợ cần đối soát' };
    }

    const totalPaid = payables.costs.reduce((s: number, c: any) => s + Number(c.paidAmount || 0), 0);

    const reconciliation = await this.prisma.vendorReconciliation.create({
      data: {
        vendorId,
        reconciliationDate: new Date(),
        totalOutstanding: payables.totalOutstanding,
        totalPaid,
        confirmedBy: userId,
        items: {
          create: payables.costs.map((c: any) => ({
            actualCostId: c.id,
            amount: Number(c.amount),
            status: c.paymentStatus,
          })),
        },
      },
      include: { items: true },
    });

    return { success: true, data: reconciliation };
  }

  async getReconciliations(vendorId: string) {
    const data = await this.prisma.vendorReconciliation.findMany({
      where: { vendorId },
      include: {
        confirmer: { select: { id: true, fullName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data };
  }

  async getReconciliationDetail(vendorId: string, reconciliationId: string) {
    const data = await this.prisma.vendorReconciliation.findFirst({
      where: { id: reconciliationId, vendorId },
      include: {
        items: true,
        confirmer: { select: { id: true, fullName: true } },
      },
    });
    if (!data) throw new NotFoundException('Reconciliation not found');
    return { success: true, data };
  }

  // ── VENDOR COST REPORT ─────────────────────────────────────

  async getVendorCostReport(year?: number) {
    const y = year || new Date().getFullYear();
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    const raw = await this.prisma.$queryRaw<
      { vendor_id: string; vendor_name: string; vendor_code: string; month: number; total: string; paid: string }[]
    >`
      SELECT v.id as vendor_id, v.name as vendor_name, v.code as vendor_code,
        EXTRACT(MONTH FROM ac.cost_date)::int as month,
        SUM(ac.amount)::text as total,
        SUM(COALESCE(ac.paid_amount, 0))::text as paid
      FROM actual_costs ac
      JOIN vendors v ON v.id = ac.vendor_id
      WHERE ac.cost_date >= ${start} AND ac.cost_date < ${end} AND ac.deleted_at IS NULL
      GROUP BY v.id, v.name, v.code, month
      ORDER BY v.name, month
    `;

    // Group by vendor
    const vendorMap = new Map<string, { id: string; name: string; code: string; months: Record<number, { total: number; paid: number }>; grandTotal: number; grandPaid: number }>();
    for (const r of raw) {
      if (!vendorMap.has(r.vendor_id)) {
        vendorMap.set(r.vendor_id, { id: r.vendor_id, name: r.vendor_name, code: r.vendor_code, months: {}, grandTotal: 0, grandPaid: 0 });
      }
      const v = vendorMap.get(r.vendor_id)!;
      v.months[r.month] = { total: Number(r.total), paid: Number(r.paid) };
      v.grandTotal += Number(r.total);
      v.grandPaid += Number(r.paid);
    }

    return { success: true, data: Array.from(vendorMap.values()), year: y };
  }
}
