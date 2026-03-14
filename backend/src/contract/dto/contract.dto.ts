import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

enum ContractStatus {
  draft = 'draft',
  active = 'active',
  expired = 'expired',
  terminated = 'terminated',
}

export class CreateContractDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsUUID()
  vendorId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
