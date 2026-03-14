import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class CreateSslCertificateDto {
  @IsString() domain: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsEnum(['DV', 'OV', 'EV', 'wildcard']) sslType?: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsDateString() issuedDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() autoRenew?: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}

export class UpdateSslCertificateDto {
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsEnum(['DV', 'OV', 'EV', 'wildcard']) sslType?: string;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsDateString() issuedDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() autoRenew?: boolean;
  @IsOptional() @IsEnum(['active', 'inactive', 'expired']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() contractId?: string;
}
