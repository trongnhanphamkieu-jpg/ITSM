import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VehicleSubscriptionService } from './vehicle-subscription.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';

@Controller('vehicle-subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleSubscriptionController {
  constructor(private readonly service: VehicleSubscriptionService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query('vehicleId') vehicleId?: string, @Query('serviceId') serviceId?: string, @Query('isActive') isActive?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ vehicleId, serviceId, isActive, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.id || req.user?.sub); }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Patch(':id/deactivate')
  @Roles('admin', 'manager')
  deactivate(@Param('id') id: string) { return this.service.deactivate(id); }
}
