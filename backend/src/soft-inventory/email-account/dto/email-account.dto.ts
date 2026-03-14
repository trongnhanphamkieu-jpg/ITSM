import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export class CreateEmailAccountDto {
  @IsString()
  email: string;

  @IsString()
  provider: string;

  @IsOptional()
  @IsInt()
  quotaMb?: number;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;
}

export class UpdateEmailAccountDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsInt()
  quotaMb?: number;

  @IsOptional()
  @IsInt()
  usedMb?: number;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;
}
