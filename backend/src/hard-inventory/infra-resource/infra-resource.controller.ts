import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { InfraResourceService } from './infra-resource.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';

@Controller('hard-inventory/infra-resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InfraResourceController {
  constructor(private readonly service: InfraResourceService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('infraType') infraType?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, vendorId, infraType, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.user?.sub || req.user?.id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
