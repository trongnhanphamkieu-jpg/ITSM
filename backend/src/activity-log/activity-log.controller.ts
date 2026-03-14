import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private svc: ActivityLogService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      userId,
      module,
      action,
      from,
      to,
      search,
    });
  }

  @Get('my-history')
  getMyHistory(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getMyHistory(req.user.id, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get('stats')
  getStats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getStats({ from, to });
  }

  @Get('modules')
  getModules() {
    return this.svc.getModules();
  }
}
