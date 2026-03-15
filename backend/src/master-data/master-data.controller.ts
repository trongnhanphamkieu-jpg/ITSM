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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { MasterDataService } from './master-data.service';
import {
  CreateMasterDataItemDto,
  UpdateMasterDataItemDto,
  CreateMasterCategoryDto,
  UpdateMasterCategoryDto,
} from './dto/master-data.dto';

@Controller('master-data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MasterDataController {
  constructor(private readonly service: MasterDataService) {}

  // ── Master Data Items ──

  @Get('items')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAllItems(
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAllItems({
      type,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('items/types')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getTypes() {
    return this.service.getAvailableTypes();
  }

  @Get('items/by-type/:type')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findByType(@Param('type') type: string) {
    return this.service.findItemsByType(type);
  }

  @Get('items/:id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findItem(@Param('id') id: string) {
    return this.service.findItemById(id);
  }

  @Post('items')
  @Roles('admin', 'manager')
  createItem(@Body() dto: CreateMasterDataItemDto) {
    return this.service.createItem(dto);
  }

  @Patch('items/:id')
  @Roles('admin', 'manager')
  updateItem(@Param('id') id: string, @Body() dto: UpdateMasterDataItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Delete('items/:id')
  @Roles('admin')
  removeItem(@Param('id') id: string) {
    return this.service.removeItem(id);
  }

  // ── Master Categories ──

  @Get('categories')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAllCategories(
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAllCategories({
      type,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    });
  }

  @Get('categories/tree/:type')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getCategoryTree(@Param('type') type: string) {
    return this.service.findCategoryTree(type);
  }

  @Get('categories/:id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findCategory(@Param('id') id: string) {
    return this.service.findCategoryById(id);
  }

  @Post('categories')
  @Roles('admin', 'manager')
  createCategory(@Body() dto: CreateMasterCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Patch('categories/:id')
  @Roles('admin', 'manager')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateMasterCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles('admin')
  removeCategory(@Param('id') id: string) {
    return this.service.removeCategory(id);
  }

  // ── Seed ──

  @Post('seed')
  @Roles('admin')
  seed() {
    return this.service.seedDefaults();
  }
}
