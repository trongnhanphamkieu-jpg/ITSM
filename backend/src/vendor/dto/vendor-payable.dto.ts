import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReconciliationDto {
  @ApiPropertyOptional({ description: 'Ghi chú đối soát' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Danh sách ID chi phí đưa vào đối soát' })
  @IsArray()
  @IsUUID('4', { each: true })
  costIds: string[];
}
