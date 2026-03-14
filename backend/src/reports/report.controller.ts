import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private svc: ReportService) {}

  @Get('budget-summary')
  getBudgetSummary(@Query('year') year?: string) {
    return this.svc.getBudgetSummary(year ? +year : new Date().getFullYear());
  }

  @Get('cost-comparison')
  getCostComparison(@Query('year') year?: string) {
    return this.svc.getCostComparison(year ? +year : new Date().getFullYear());
  }

  @Get('asset-overview')
  getAssetOverview() {
    return this.svc.getAssetOverview();
  }

  @Get('project-budget')
  getProjectBudget(@Query('year') year?: string) {
    return this.svc.getProjectBudgetReport(year ? +year : undefined);
  }
}
