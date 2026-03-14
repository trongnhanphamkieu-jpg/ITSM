import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'an@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: ['admin', 'manager', 'staff', 'finance', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'staff', 'finance', 'viewer'])
  role?: string;

  @ApiPropertyOptional({ example: 'Phòng CNTT' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn An' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ enum: ['admin', 'manager', 'staff', 'finance', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'staff', 'finance', 'viewer'])
  role?: string;

  @ApiPropertyOptional({ example: 'Phòng CNTT' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['active', 'locked', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'locked', 'inactive'])
  status?: string;
}
