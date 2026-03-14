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
import { CostService } from './cost.service';
import { CreateActualCostDto, UpdateActualCostDto } from './dto/cost.dto';

@ApiTags('Actual Costs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('actual-costs')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get()
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
  getCategories() {
    return this.costService.getCategories();
  }

  @Get('summary')
  getSummary() {
    return this.costService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateActualCostDto, @Req() req: { user: { id: string } }) {
    return this.costService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActualCostDto) {
    return this.costService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costService.remove(id);
  }
}
