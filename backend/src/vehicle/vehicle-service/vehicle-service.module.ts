import { Module } from '@nestjs/common';
import { VehicleSvcService } from './vehicle-service.service';
import { VehicleSvcController } from './vehicle-service.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleSvcService],
  controllers: [VehicleSvcController],
})
export class VehicleServiceModule {}
