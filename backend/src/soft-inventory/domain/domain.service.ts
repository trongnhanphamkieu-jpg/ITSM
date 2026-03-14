import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomainDto, UpdateDomainDto } from './dto/domain.dto';

@Injectable()
export class DomainService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; vendorId?: string; page?: number; limit?: number }) {
    const { search, status, vendorId, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { domain: { contains: search, mode: 'insensitive' } },
        { registrar: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      this.prisma.domain.findMany({
        where,
        include: { vendor: { select: { id: true, name: true } } },
        orderBy: { expiryDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.domain.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.domain.findFirst({ where: { id, deletedAt: null }, include: { vendor: { select: { id: true, name: true } }, contract: { select: { id: true, code: true, name: true } } } });
    if (!item) throw new NotFoundException('Domain not found');
    return { success: true, data: item };
  }

  async create(dto: CreateDomainDto, userId: string) {
    const item = await this.prisma.domain.create({ data: { ...dto, createdById: userId } as any });
    return { success: true, data: item };
  }

  async update(id: string, dto: UpdateDomainDto) {
    await this.findOne(id);
    const item = await this.prisma.domain.update({ where: { id }, data: dto as any });
    return { success: true, data: item };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.domain.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Domain deleted' };
  }
}
