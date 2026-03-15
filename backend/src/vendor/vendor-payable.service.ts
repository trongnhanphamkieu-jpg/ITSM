import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReconciliationDto } from './dto/vendor-payable.dto';

@Injectable()
export class VendorPayableService {
  constructor(private prisma: PrismaService) {}

  /**
   * Real-time aggregate: total costs, paid, unpaid for a vendor
   */
  async getPayables(vendorId: string) {
    // Verify vendor exists
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('NCC không tồn tại');

    const costs = await this.prisma.actualCost.findMany({
      where: { vendorId, deletedAt: null },
      select: {
        id: true,
        categoryName: true,
        description: true,
        amount: true,
        paidAmount: true,
        costDate: true,
        paymentStatus: true,
        invoiceNo: true,
      },
      orderBy: { costDate: 'desc' },
    });

    let totalAmount = 0;
    let totalPaid = 0;

    const items = costs.map((c) => {
      const amount = Number(c.amount);
      const paid = Number(c.paidAmount || 0);
      totalAmount += amount;
      totalPaid += paid;
      return {
        ...c,
        amount,
        paidAmount: paid,
        unpaid: amount - paid,
      };
    });

    return {
      success: true,
      data: {
        vendorId,
        vendorName: vendor.name,
        vendorCode: vendor.code,
        totalAmount,
        totalPaid,
        totalUnpaid: totalAmount - totalPaid,
        costCount: costs.length,
        costs: items,
      },
    };
  }

  /**
   * Summary across all vendors with outstanding balances
   */
  async getPayablesSummary() {
    const vendors = await this.prisma.vendor.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    const results = [];

    for (const vendor of vendors) {
      const agg = await this.prisma.actualCost.aggregate({
        where: { vendorId: vendor.id, deletedAt: null },
        _sum: { amount: true, paidAmount: true },
        _count: true,
      });

      const totalAmount = Number(agg._sum.amount || 0);
      const totalPaid = Number(agg._sum.paidAmount || 0);
      const totalUnpaid = totalAmount - totalPaid;

      if (totalAmount > 0) {
        results.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          vendorCode: vendor.code,
          totalAmount,
          totalPaid,
          totalUnpaid,
          costCount: agg._count,
        });
      }
    }

    // Sort by unpaid desc
    results.sort((a, b) => b.totalUnpaid - a.totalUnpaid);

    const grandTotal = results.reduce((s, r) => s + r.totalAmount, 0);
    const grandPaid = results.reduce((s, r) => s + r.totalPaid, 0);

    return {
      success: true,
      data: {
        vendors: results,
        summary: {
          totalAll: grandTotal,
          totalPaid: grandPaid,
          totalUnpaid: grandTotal - grandPaid,
          vendorCount: results.length,
        },
      },
    };
  }

  /**
   * Create reconciliation snapshot for a vendor
   */
  async createReconciliation(vendorId: string, dto: CreateReconciliationDto, userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('NCC không tồn tại');

    // Fetch costs to snapshot
    const costs = await this.prisma.actualCost.findMany({
      where: { id: { in: dto.costIds }, vendorId, deletedAt: null },
      select: { id: true, amount: true, paidAmount: true, paymentStatus: true },
    });

    const totalOutstanding = costs.reduce((s, c) => s + (Number(c.amount) - Number(c.paidAmount || 0)), 0);
    const totalPaid = costs.reduce((s, c) => s + Number(c.paidAmount || 0), 0);

    const reconciliation = await this.prisma.vendorReconciliation.create({
      data: {
        vendorId,
        reconciliationDate: new Date(),
        totalOutstanding,
        totalPaid,
        confirmedBy: userId,
        notes: dto.notes || null,
        items: {
          create: costs.map((c) => ({
            actualCostId: c.id,
            amount: c.amount,
            status: c.paymentStatus,
          })),
        },
      },
      include: {
        items: true,
        confirmer: { select: { id: true, fullName: true } },
      },
    });

    return { success: true, data: reconciliation };
  }

  /**
   * List reconciliation history for a vendor
   */
  async getReconciliations(vendorId: string) {
    const reconciliations = await this.prisma.vendorReconciliation.findMany({
      where: { vendorId },
      include: {
        confirmer: { select: { id: true, fullName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { reconciliationDate: 'desc' },
    });

    return { success: true, data: reconciliations };
  }

  /**
   * Get detail of a specific reconciliation
   */
  async getReconciliationDetail(vendorId: string, reconciliationId: string) {
    const reconciliation = await this.prisma.vendorReconciliation.findFirst({
      where: { id: reconciliationId, vendorId },
      include: {
        confirmer: { select: { id: true, fullName: true } },
        items: true,
      },
    });

    if (!reconciliation) throw new NotFoundException('Đối soát không tồn tại');

    // Manual join: fetch actual cost details for each item
    const costIds = reconciliation.items.map((i) => i.actualCostId);
    const costs = await this.prisma.actualCost.findMany({
      where: { id: { in: costIds } },
      select: {
        id: true,
        categoryName: true,
        description: true,
        amount: true,
        paidAmount: true,
        costDate: true,
        invoiceNo: true,
      },
    });
    const costMap = new Map(costs.map((c) => [c.id, c]));

    const itemsWithCosts = reconciliation.items.map((item) => ({
      ...item,
      actualCost: costMap.get(item.actualCostId) || null,
    }));

    return {
      success: true,
      data: { ...reconciliation, items: itemsWithCosts },
    };
  }
}
