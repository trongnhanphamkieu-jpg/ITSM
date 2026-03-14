import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VehicleSubscriptionService } from './vehicle-subscription.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('vehicle-subscriptions')
@UseGuards(JwtAuthGuard)
export class VehicleSubscriptionController {
  constructor(private readonly service: VehicleSubscriptionService) {}

  @Get()
  findAll(@Query('vehicleId') vehicleId?: string, @Query('serviceId') serviceId?: string, @Query('isActive') isActive?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ vehicleId, serviceId, isActive, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.id || req.user?.sub); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) { return this.service.deactivate(id); }
}
