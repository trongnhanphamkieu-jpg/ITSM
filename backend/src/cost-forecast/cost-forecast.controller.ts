import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { CostForecastService } from './cost-forecast.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('cost-forecasts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CostForecastController {
  constructor(private readonly svc: CostForecastService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(@Query() query: { year?: string; status?: string }) {
    return this.svc.findAll(query);
  }

  @Get('yearly-summary')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  yearlySummary(@Query('year') year: string) {
    return this.svc.yearlySummary(Number(year) || new Date().getFullYear());
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/vs-actual')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  vsActual(@Param('id') id: string) {
    return this.svc.vsActual(id);
  }

  @Get(':id/history')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  async getHistory(@Param('id') id: string) {
    const forecast = await this.svc.findOne(id);
    return forecast.history;
  }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() body: any, @Req() req: any) {
    return this.svc.create(body, req.user.id);
  }

  @Put(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/items')
  @Roles('admin', 'manager', 'staff')
  addItem(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.addItem(id, body, req.user.id);
  }

  @Delete(':id/items/:itemId')
  @Roles('admin', 'manager')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.svc.removeItem(id, itemId);
  }

  @Post(':id/submit')
  @Roles('admin', 'manager', 'staff')
  submit(@Param('id') id: string, @Req() req: any) {
    return this.svc.submit(id, req.user.id);
  }

  @Post(':id/approve')
  @Roles('admin', 'manager')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.approve(id, req.user.id, body?.comment);
  }

  @Post(':id/reject')
  @Roles('admin', 'manager')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.reject(id, req.user.id, body.reason);
  }

  @Post(':id/clone')
  @Roles('admin', 'manager', 'staff')
  clone(@Param('id') id: string, @Req() req: any) {
    return this.svc.clone(id, req.user.id);
  }
}
