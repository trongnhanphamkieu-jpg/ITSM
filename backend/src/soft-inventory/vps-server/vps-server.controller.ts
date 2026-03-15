import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { VpsServerService } from './vps-server.service';
import { CreateVpsServerDto, UpdateVpsServerDto } from './dto/vps-server.dto';

@Controller('soft-inventory/vps-servers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VpsServerController {
  constructor(private readonly service: VpsServerService) {}

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
  create(@Body() dto: CreateVpsServerDto, @Request() req: any) { return this.service.create(dto, req.user.id); }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() dto: UpdateVpsServerDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
