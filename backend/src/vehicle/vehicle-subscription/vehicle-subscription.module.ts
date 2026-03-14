import { Module } from '@nestjs/common';
import { VehicleSubscriptionService } from './vehicle-subscription.service';
import { VehicleSubscriptionController } from './vehicle-subscription.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleSubscriptionService],
  controllers: [VehicleSubscriptionController],
})
export class VehicleSubscriptionModule {}
