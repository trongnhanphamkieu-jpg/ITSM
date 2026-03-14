import { Module } from '@nestjs/common';
import { VehicleSubModule } from './vehicle-sub/vehicle-sub.module';
import { VehicleServiceModule } from './vehicle-service/vehicle-service.module';
import { VehicleCostModule } from './vehicle-cost/vehicle-cost.module';
import { VehicleSubscriptionModule } from './vehicle-subscription/vehicle-subscription.module';

@Module({
  imports: [VehicleSubModule, VehicleServiceModule, VehicleCostModule, VehicleSubscriptionModule],
})
export class VehicleModule {}
