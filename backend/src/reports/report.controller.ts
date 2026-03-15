import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private svc: ReportService) {}

  @Get('budget-summary')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getBudgetSummary(@Query('year') year?: string) {
    return this.svc.getBudgetSummary(year ? +year : new Date().getFullYear());
  }

  @Get('cost-comparison')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getCostComparison(@Query('year') year?: string) {
    return this.svc.getCostComparison(year ? +year : new Date().getFullYear());
  }

  @Get('asset-overview')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getAssetOverview() {
    return this.svc.getAssetOverview();
  }

  @Get('project-budget')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getProjectBudget(@Query('year') year?: string) {
    return this.svc.getProjectBudgetReport(year ? +year : undefined);
  }
}
