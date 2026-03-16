import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import {
  CreateBudgetPlanDto,
  UpdateBudgetPlanDto,
  ApproveBudgetDto,
} from './dto/budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { RequirePermission } from '../auth/guards/permission.guard';
import { BudgetStatus } from '@prisma/client';

@ApiTags('Budget Plans')
@Controller('budget-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  @Roles('admin', 'manager', 'finance', 'staff')
  @ApiOperation({ summary: 'Danh sách kế hoạch ngân sách' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BudgetStatus })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('year') year?: string,
    @Query('status') status?: BudgetStatus,
  ) {
    return this.budgetService.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      search,
      year ? +year : undefined,
      status,
    );
  }

  @Get(':id')
  @Roles('admin', 'manager', 'finance', 'staff', 'viewer')
  @ApiOperation({ summary: 'Chi tiết kế hoạch ngân sách' })
  findOne(@Param('id') id: string) {
    return this.budgetService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'finance')
  @RequirePermission('budget_plan', 'create')
  @ApiOperation({ summary: 'Tạo kế hoạch ngân sách mới' })
  create(
    @Body() dto: CreateBudgetPlanDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.budgetService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'finance')
  @RequirePermission('budget_plan', 'edit')
  @ApiOperation({ summary: 'Cập nhật kế hoạch ngân sách' })
  update(@Param('id') id: string, @Body() dto: UpdateBudgetPlanDto) {
    return this.budgetService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @RequirePermission('budget_plan', 'delete')
  @ApiOperation({ summary: 'Xóa kế hoạch ngân sách (chỉ trạng thái Nháp)' })
  delete(@Param('id') id: string) {
    return this.budgetService.delete(id);
  }

  // ── Approval Workflow ──

  @Post(':id/submit')
  @Roles('admin', 'manager', 'finance')
  @ApiOperation({ summary: 'Gửi duyệt kế hoạch ngân sách' })
  submit(@Param('id') id: string) {
    return this.budgetService.submitForApproval(id);
  }

  @Post(':id/approve')
  @Roles('admin', 'manager')
  @RequirePermission('budget_plan', 'approve')
  @ApiOperation({ summary: 'Phê duyệt kế hoạch ngân sách' })
  approve(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.budgetService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Từ chối kế hoạch ngân sách' })
  reject(
    @Param('id') id: string,
    @Body() dto: ApproveBudgetDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.budgetService.reject(id, req.user.id, dto.rejectionNote);
  }

  @Post(':id/revert')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Đưa kế hoạch về trạng thái Nháp' })
  revert(@Param('id') id: string) {
    return this.budgetService.revertToDraft(id);
  }
}
