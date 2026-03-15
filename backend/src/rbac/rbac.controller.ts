import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RbacController {
  constructor(private svc: RbacService) {}

  @Get('roles')
  @Roles('admin', 'manager', 'viewer')
  findAll() {
    return this.svc.findAll();
  }

  @Get('roles/:id')
  @Roles('admin', 'manager', 'viewer')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Post('roles')
  @Roles('admin')
  create(@Body() dto: { code: string; name: string; description?: string; permissions?: any[] }) {
    return this.svc.create(dto);
  }

  @Patch('roles/:id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete('roles/:id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('seed')
  @Roles('admin')
  seed() {
    return this.svc.seedSystemRoles();
  }

  @Get('modules')
  @Roles('admin', 'manager', 'viewer')
  getModules() {
    return this.svc.getModuleCodes();
  }

  @Get('users/:userId/permissions')
  @Roles('admin', 'manager', 'viewer')
  getUserPermissions(@Param('userId') userId: string) {
    return this.svc.getUserPermissions(userId);
  }
}
