import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { CostForecastService } from './cost-forecast.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cost-forecasts')
@UseGuards(JwtAuthGuard)
export class CostForecastController {
  constructor(private readonly svc: CostForecastService) {}

  @Get()
  findAll(@Query() query: { year?: string; status?: string }) {
    return this.svc.findAll(query);
  }

  @Get('yearly-summary')
  yearlySummary(@Query('year') year: string) {
    return this.svc.yearlySummary(Number(year) || new Date().getFullYear());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/vs-actual')
  vsActual(@Param('id') id: string) {
    return this.svc.vsActual(id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    const forecast = await this.svc.findOne(id);
    return forecast.history;
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

  // Items
  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.addItem(id, body, req.user.id);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.svc.removeItem(id, itemId);
  }

  // Workflow
  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: any) {
    return this.svc.submit(id, req.user.id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.approve(id, req.user.id, body?.comment);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.svc.reject(id, req.user.id, body.reason);
  }

  // Clone
  @Post(':id/clone')
  clone(@Param('id') id: string, @Req() req: any) {
    return this.svc.clone(id, req.user.id);
  }
}
