import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VehicleCostService } from './vehicle-cost.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('vehicle-costs')
@UseGuards(JwtAuthGuard)
export class VehicleCostController {
  constructor(private readonly service: VehicleCostService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('vehicleId') vehicleId?: string, @Query('serviceId') serviceId?: string, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, vehicleId, serviceId, dateFrom, dateTo, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get('summary')
  summary(@Query('vehicleId') vehicleId?: string, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.service.summary({ vehicleId, dateFrom, dateTo });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.id || req.user?.sub); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
