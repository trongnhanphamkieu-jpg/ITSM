import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { VehicleSubService } from './vehicle-sub.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehicleSubController {
  constructor(private readonly service: VehicleSubService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('type') type?: string, @Query('vendorId') vendorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, type, vendorId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id/cost-summary')
  costSummary(@Param('id') id: string) { return this.service.costSummary(id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: any, @Req() req: any) { return this.service.create(body, req.user?.id || req.user?.sub); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
