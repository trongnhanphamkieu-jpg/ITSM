import { Module } from '@nestjs/common';
import { VehicleCostService } from './vehicle-cost.service';
import { VehicleCostController } from './vehicle-cost.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleCostService],
  controllers: [VehicleCostController],
})
export class VehicleCostModule {}
