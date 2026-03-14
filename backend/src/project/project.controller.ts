import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly svc: ProjectService) {}

  @Get()
  findAll(@Query() query: { search?: string; status?: string }) {
    return this.svc.findAll(query);
  }

  @Get('budget-overview')
  budgetOverview() {
    return this.svc.budgetOverview();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/budget-summary')
  budgetSummary(@Param('id') id: string) {
    return this.svc.budgetSummary(id);
  }

  @Get(':id/budget-items')
  getBudgetItems(@Param('id') id: string) {
    return this.svc.getBudgetItems(id);
  }

  @Post(':id/budget-items')
  addBudgetItem(@Param('id') id: string, @Body() body: any) {
    return this.svc.addBudgetItem(id, body);
  }

  @Delete(':id/budget-items/:itemId')
  removeBudgetItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.svc.removeBudgetItem(id, itemId);
  }

  @Get(':id/actual-costs')
  getActualCosts(@Param('id') id: string) {
    return this.svc.getActualCosts(id);
  }

  @Post(':id/actual-costs')
  addActualCost(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.addActualCost(id, body, req.user.id);
  }

  @Delete(':id/actual-costs/:costId')
  removeActualCost(@Param('id') id: string, @Param('costId') costId: string) {
    return this.svc.removeActualCost(id, costId);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.svc.create(body, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
