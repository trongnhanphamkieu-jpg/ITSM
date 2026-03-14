import { Module } from '@nestjs/common';
import { CostForecastService } from './cost-forecast.service';
import { CostForecastController } from './cost-forecast.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostForecastController],
  providers: [CostForecastService],
})
export class CostForecastModule {}
