import { IsString, IsOptional, IsInt, IsDateString, IsEnum, IsNumber } from 'class-validator';

export class CreateSoftwareLicenseDto {
  @IsString() name: string;
  @IsOptional() @IsString() publisher?: string;
  @IsOptional() @IsString() licenseKey?: string;
  @IsOptional() @IsEnum(['perpetual', 'subscription', 'trial', 'oem']) licenseType?: string;
  @IsOptional() @IsInt() seats?: number;
  @IsOptional() @IsInt() usedSeats?: number;
  @IsOptional() @IsDateString() purchaseDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsNumber() cost?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}

export class UpdateSoftwareLicenseDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() publisher?: string;
  @IsOptional() @IsString() licenseKey?: string;
  @IsOptional() @IsEnum(['perpetual', 'subscription', 'trial', 'oem']) licenseType?: string;
  @IsOptional() @IsInt() seats?: number;
  @IsOptional() @IsInt() usedSeats?: number;
  @IsOptional() @IsDateString() purchaseDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsNumber() cost?: number;
  @IsOptional() @IsEnum(['active', 'inactive', 'expired']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}
