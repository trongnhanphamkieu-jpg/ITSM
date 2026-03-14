import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VpsServerService } from './vps-server.service';
import { CreateVpsServerDto, UpdateVpsServerDto } from './dto/vps-server.dto';

@Controller('soft-inventory/vps-servers')
@UseGuards(JwtAuthGuard)
export class VpsServerController {
  constructor(private readonly service: VpsServerService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, vendorId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateVpsServerDto, @Request() req: any) { return this.service.create(dto, req.user.id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVpsServerDto) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
