import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EmailAccountService } from './email-account.service';
import { CreateEmailAccountDto, UpdateEmailAccountDto } from './dto/email-account.dto';

@Controller('soft-inventory/email-accounts')
@UseGuards(JwtAuthGuard)
export class EmailAccountController {
  constructor(private readonly service: EmailAccountService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('status') status?: string, @Query('vendorId') vendorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ search, status, vendorId, page: page ? +page : undefined, limit: limit ? +limit : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateEmailAccountDto, @Request() req: any) { return this.service.create(dto, req.user.id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmailAccountDto) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
