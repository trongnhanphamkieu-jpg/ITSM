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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { CostService } from './cost.service';
import { CreateActualCostDto, UpdateActualCostDto } from './dto/cost.dto';

@ApiTags('Actual Costs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('actual-costs')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryName') categoryName?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.costService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      categoryName,
      dateFrom,
      dateTo,
    });
  }

  @Get('categories')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getCategories() {
    return this.costService.getCategories();
  }

  @Get('summary')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getSummary() {
    return this.costService.getSummary();
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) {
    return this.costService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() dto: CreateActualCostDto, @Req() req: { user: { id: string } }) {
    return this.costService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() dto: UpdateActualCostDto) {
    return this.costService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.costService.remove(id);
  }
}
