import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetItemDto {
  @ApiProperty({ example: 'Laptop Dell Latitude 5540' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Core i7, 16GB RAM' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Cái' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 25000000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class BudgetCategoryDto {
  @ApiProperty({ example: 'Phần cứng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'FK to MasterCategory (budget_category type)' })
  @IsOptional()
  @IsString()
  masterCategoryId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ type: [BudgetItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  items: BudgetItemDto[];
}

export class CreateBudgetPlanDto {
  @ApiProperty({ example: 'Ngân sách CNTT Q1/2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  @Max(2050)
  year: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiPropertyOptional({ example: 'Ngân sách mua sắm thiết bị CNTT quý 1' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [BudgetCategoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetCategoryDto)
  categories: BudgetCategoryDto[];
}

export class UpdateBudgetPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2050)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [BudgetCategoryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetCategoryDto)
  categories?: BudgetCategoryDto[];
}

export class ApproveBudgetDto {
  @ApiPropertyOptional({ example: 'Từ chối vì vượt ngân sách' })
  @IsOptional()
  @IsString()
  rejectionNote?: string;
}
