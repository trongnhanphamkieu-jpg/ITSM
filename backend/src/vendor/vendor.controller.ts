import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { VendorService } from './vendor.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.vendorService.findAll({
      search,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() dto: CreateVendorDto, @Request() req: any) {
    return this.vendorService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(id);
  }
}
