import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SslCertificateService } from './ssl-certificate.service';
import { CreateSslCertificateDto, UpdateSslCertificateDto } from './dto/ssl-certificate.dto';

@Controller('soft-inventory/ssl-certificates')
@UseGuards(JwtAuthGuard)
export class SslCertificateController {
  constructor(private readonly service: SslCertificateService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, vendorId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateSslCertificateDto, @Request() req: any) { return this.service.create(dto, req.user.id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSslCertificateDto) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
