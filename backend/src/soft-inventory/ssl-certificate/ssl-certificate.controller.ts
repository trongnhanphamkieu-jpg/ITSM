import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { SslCertificateService } from './ssl-certificate.service';
import { CreateSslCertificateDto, UpdateSslCertificateDto } from './dto/ssl-certificate.dto';

@Controller('soft-inventory/ssl-certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SslCertificateController {
  constructor(private readonly service: SslCertificateService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, vendorId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() dto: CreateSslCertificateDto, @Request() req: any) { return this.service.create(dto, req.user.id); }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() dto: UpdateSslCertificateDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
