import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.findAll(req.user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('unread-count')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
