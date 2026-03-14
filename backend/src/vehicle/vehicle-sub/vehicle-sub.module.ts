import { Module } from '@nestjs/common';
import { VehicleSubService } from './vehicle-sub.service';
import { VehicleSubController } from './vehicle-sub.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleSubService],
  controllers: [VehicleSubController],
})
export class VehicleSubModule {}
