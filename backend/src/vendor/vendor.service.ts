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
}
