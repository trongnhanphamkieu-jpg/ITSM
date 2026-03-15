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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { ContractService } from './contract.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findAll(
    @Query('search') search?: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contractService.findAll({
      search,
      vendorId,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager', 'staff', 'finance', 'viewer')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Post()
  @Roles('admin', 'manager', 'staff')
  create(@Body() dto: CreateContractDto, @Request() req: any) {
    return this.contractService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }

  @Post(':id/attachments')
  @Roles('admin', 'manager', 'staff')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const storageKey = `contracts/${id}/${Date.now()}_${file.originalname}`;
    return this.contractService.addAttachment(
      id,
      {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageKey,
      },
      req.user.id,
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @Roles('admin', 'manager')
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.contractService.removeAttachment(id, attachmentId);
  }
}
