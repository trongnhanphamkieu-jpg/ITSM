import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController {
  constructor(private readonly svc: ProjectService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query() query: { search?: string; status?: string }) {
    return this.svc.findAll(query);
  }

  @Get('budget-overview')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  budgetOverview() {
    return this.svc.budgetOverview();
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/budget-summary')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  budgetSummary(@Param('id') id: string) {
    return this.svc.budgetSummary(id);
  }

  @Get(':id/budget-items')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getBudgetItems(@Param('id') id: string) {
    return this.svc.getBudgetItems(id);
  }

  @Post(':id/budget-items')
  @Roles('admin', 'manager', 'staff')
  addBudgetItem(@Param('id') id: string, @Body() body: any) {
    return this.svc.addBudgetItem(id, body);
  }

  @Delete(':id/budget-items/:itemId')
  @Roles('admin', 'manager')
  removeBudgetItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.svc.removeBudgetItem(id, itemId);
  }

  @Get(':id/actual-costs')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getActualCosts(@Param('id') id: string) {
    return this.svc.getActualCosts(id);
  }

  @Post(':id/actual-costs')
  @Roles('admin', 'manager', 'staff')
  addActualCost(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.addActualCost(id, body, req.user.id);
  }

  @Delete(':id/actual-costs/:costId')
  @Roles('admin', 'manager')
  removeActualCost(@Param('id') id: string, @Param('costId') costId: string) {
    return this.svc.removeActualCost(id, costId);
  }

  @Post()
  @Roles('admin', 'manager')
  create(@Body() body: any, @Req() req: any) {
    return this.svc.create(body, req.user.id);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
