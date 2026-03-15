import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'quarter', required: false })
  getSummary(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
  ) {
    return this.dashboardService.getSummary(
      year ? +year : undefined,
      month ? +month : undefined,
      quarter ? +quarter : undefined,
    );
  }
}
