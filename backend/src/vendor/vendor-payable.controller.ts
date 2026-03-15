import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { VendorPayableService } from './vendor-payable.service';
import { CreateReconciliationDto } from './dto/vendor-payable.dto';

@ApiTags('Vendor Payables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors')
export class VendorPayableController {
  constructor(private readonly payableService: VendorPayableService) {}

  @Get('payables-summary')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getPayablesSummary() {
    return this.payableService.getPayablesSummary();
  }

  @Get(':id/payables')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getPayables(@Param('id') id: string) {
    return this.payableService.getPayables(id);
  }

  @Post(':id/reconciliations')
  @Roles('admin', 'manager', 'finance')
  createReconciliation(
    @Param('id') id: string,
    @Body() dto: CreateReconciliationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.payableService.createReconciliation(id, dto, req.user.id);
  }

  @Get(':id/reconciliations')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getReconciliations(@Param('id') id: string) {
    return this.payableService.getReconciliations(id);
  }

  @Get(':id/reconciliations/:rid')
  @Roles('admin', 'manager', 'finance', 'viewer')
  getReconciliationDetail(
    @Param('id') id: string,
    @Param('rid') rid: string,
  ) {
    return this.payableService.getReconciliationDetail(id, rid);
  }
}
