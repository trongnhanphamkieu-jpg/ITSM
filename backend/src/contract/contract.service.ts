import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    search?: string;
    vendorId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, vendorId, status, page = 1, limit = 20 } = query;
    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          vendor: { select: { id: true, name: true, code: true } },
          _count: { select: { attachments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, deletedAt: null },
      include: {
        vendor: { select: { id: true, name: true, code: true, email: true, phone: true } },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { id: true, fullName: true } } },
        },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    return { success: true, data: contract };
  }

  async create(dto: CreateContractDto, userId: string) {
    const code = await this.generateCode();
    const contract = await this.prisma.contract.create({
      data: {
        code,
        name: dto.name,
        vendorId: dto.vendorId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        value: dto.value || 0,
        description: dto.description,
        terms: dto.terms,
        createdById: userId,
      },
    });
    return { success: true, data: contract };
  }

  async update(id: string, dto: UpdateContractDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    const contract = await this.prisma.contract.update({
      where: { id },
      data,
    });
    return { success: true, data: contract };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contract.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Contract deleted' };
  }

  async addAttachment(
    contractId: string,
    file: { fileName: string; fileSize: number; mimeType: string; storageKey: string },
    userId: string,
  ) {
    await this.findOne(contractId);
    const attachment = await this.prisma.contractAttachment.create({
      data: { ...file, contractId, uploadedById: userId },
    });
    return { success: true, data: attachment };
  }

  async removeAttachment(contractId: string, attachmentId: string) {
    const attachment = await this.prisma.contractAttachment.findFirst({
      where: { id: attachmentId, contractId },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.prisma.contractAttachment.delete({ where: { id: attachmentId } });
    return { success: true, message: 'Attachment deleted' };
  }

  async getExpiringContracts(daysAhead: number) {
    const now = new Date();
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);

    return this.prisma.contract.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        endDate: { gte: now, lte: target },
      },
      include: {
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.contract.count({
      where: {
        code: { startsWith: `HD-${year}` },
      },
    });
    return `HD-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
