import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmailAccountDto, UpdateEmailAccountDto } from './dto/email-account.dto';

@Injectable()
export class EmailAccountService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; vendorId?: string; page?: number; limit?: number }) {
    const { search, status, vendorId, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      this.prisma.emailAccount.findMany({
        where,
        include: { vendor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.emailAccount.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.emailAccount.findFirst({ where: { id, deletedAt: null }, include: { vendor: { select: { id: true, name: true } }, contract: { select: { id: true, code: true, name: true } } } });
    if (!item) throw new NotFoundException('Email account not found');
    return { success: true, data: item };
  }

  async create(dto: CreateEmailAccountDto, userId: string) {
    const item = await this.prisma.emailAccount.create({ data: { ...dto, createdById: userId } });
    return { success: true, data: item };
  }

  async update(id: string, dto: UpdateEmailAccountDto) {
    await this.findOne(id);
    const item = await this.prisma.emailAccount.update({ where: { id }, data: dto as any });
    return { success: true, data: item };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.emailAccount.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'Email account deleted' };
  }
}
