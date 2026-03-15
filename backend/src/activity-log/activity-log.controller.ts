import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('activity-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
  constructor(private svc: ActivityLogService) {}

  @Get()
  @Roles('admin', 'manager')
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
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getMyHistory(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.getMyHistory(req.user.id, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get('stats')
  @Roles('admin', 'manager')
  getStats(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getStats({ from, to });
  }

  @Get('modules')
  @Roles('admin', 'manager')
  getModules() {
    return this.svc.getModules();
  }
}
