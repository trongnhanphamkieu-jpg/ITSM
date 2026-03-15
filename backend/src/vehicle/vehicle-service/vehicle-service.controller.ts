import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VehicleSvcService } from './vehicle-service.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';

@Controller('vehicle-services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleSvcController {
  constructor(private readonly service: VehicleSvcService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query('search') search?: string, @Query('costType') costType?: string, @Query('frequency') frequency?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, costType, frequency, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('admin', 'manager')
  create(@Body() body: any) { return this.service.create(body); }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
