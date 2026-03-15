import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VehicleSubService } from './vehicle-sub.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleSubController {
  constructor(private readonly service: VehicleSubService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('type') type?: string, @Query('vendorId') vendorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, type, vendorId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id/cost-summary')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  costSummary(@Param('id') id: string) { return this.service.costSummary(id); }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.id || req.user?.sub); }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
