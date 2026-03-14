import { Module } from '@nestjs/common';
import { HardwareAssetModule } from './hardware-asset/hardware-asset.module';
import { InfraResourceModule } from './infra-resource/infra-resource.module';
import { IpAddressModule } from './ip-address/ip-address.module';

@Module({
  imports: [HardwareAssetModule, InfraResourceModule, IpAddressModule],
})
export class HardInventoryModule {}
