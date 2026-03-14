import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';

export class CreateVpsServerDto {
  @IsString() hostname: string;
  @IsOptional() @IsString() ipAddress?: string;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() os?: string;
  @IsOptional() @IsString() cpu?: string;
  @IsOptional() @IsInt() ramGb?: number;
  @IsOptional() @IsInt() storageGb?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}

export class UpdateVpsServerDto {
  @IsOptional() @IsString() hostname?: string;
  @IsOptional() @IsString() ipAddress?: string;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() os?: string;
  @IsOptional() @IsString() cpu?: string;
  @IsOptional() @IsInt() ramGb?: number;
  @IsOptional() @IsInt() storageGb?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsEnum(['active', 'inactive', 'expired']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}
