import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class CreateDomainDto {
  @IsString() domain: string;
  @IsOptional() @IsString() registrar?: string;
  @IsOptional() @IsString() nameservers?: string;
  @IsOptional() @IsDateString() registrationDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() autoRenew?: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}

export class UpdateDomainDto {
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsString() registrar?: string;
  @IsOptional() @IsString() nameservers?: string;
  @IsOptional() @IsDateString() registrationDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() autoRenew?: boolean;
  @IsOptional() @IsEnum(['active', 'inactive', 'expired']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}
