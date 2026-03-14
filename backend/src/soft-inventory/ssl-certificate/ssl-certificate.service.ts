import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSslCertificateDto, UpdateSslCertificateDto } from './dto/ssl-certificate.dto';

@Injectable()
export class SslCertificateService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { search?: string; status?: string; vendorId?: string; page?: number; limit?: number }) {
    const { search, status, vendorId, page = 1, limit = 20 } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { domain: { contains: search, mode: 'insensitive' } },
        { issuer: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      this.prisma.sslCertificate.findMany({
        where,
        include: { vendor: { select: { id: true, name: true } } },
        orderBy: { expiryDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sslCertificate.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.sslCertificate.findFirst({ where: { id, deletedAt: null }, include: { vendor: { select: { id: true, name: true } }, contract: { select: { id: true, code: true, name: true } } } });
    if (!item) throw new NotFoundException('SSL certificate not found');
    return { success: true, data: item };
  }

  async create(dto: CreateSslCertificateDto, userId: string) {
    const item = await this.prisma.sslCertificate.create({ data: { ...dto, createdById: userId } as any });
    return { success: true, data: item };
  }

  async update(id: string, dto: UpdateSslCertificateDto) {
    await this.findOne(id);
    const item = await this.prisma.sslCertificate.update({ where: { id }, data: dto as any });
    return { success: true, data: item };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.sslCertificate.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true, message: 'SSL certificate deleted' };
  }
}
