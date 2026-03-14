import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSoftwareLicenseDto, UpdateSoftwareLicenseDto } from './dto/software-license.dto';

@Injectable()
export class SoftwareLicenseService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; vendorId?: string; page?: number; limit?: number }) {
    const { search, status, vendorId, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } },
        { licenseKey: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      this.prisma.softwareLicense.findMany({
        where,
        include: { vendor: { select: { id: true, name: true } } },
        orderBy: { expiryDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.softwareLicense.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.softwareLicense.findFirst({ where: { id, deletedAt: null }, include: { vendor: { select: { id: true, name: true } }, contract: { select: { id: true, code: true, name: true } } } });
    if (!item) throw new NotFoundException('Software license not found');
    return { success: true, data: item };
  }

  async create(dto: CreateSoftwareLicenseDto, userId: string) {
    const item = await this.prisma.softwareLicense.create({ data: { ...dto, createdById: userId } as any });
    return { success: true, data: item };
  }

  async update(id: string, dto: UpdateSoftwareLicenseDto) {
    await this.findOne(id);
    const item = await this.prisma.softwareLicense.update({ where: { id }, data: dto as any });
    return { success: true, data: item };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.softwareLicense.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Software license deleted' };
  }
}
