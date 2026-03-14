import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { HardwareAssetService } from './hardware-asset.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('hard-inventory/hardware-assets')
@UseGuards(JwtAuthGuard)
export class HardwareAssetController {
  constructor(private readonly service: HardwareAssetService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('category') category?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, vendorId, category, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create(dto, req.user?.sub || req.user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
