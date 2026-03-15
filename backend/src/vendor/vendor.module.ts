import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { VendorPayableController } from './vendor-payable.controller';
import { VendorPayableService } from './vendor-payable.service';

@Module({
  controllers: [VendorController, VendorPayableController],
  providers: [VendorService, VendorPayableService],
  exports: [VendorService, VendorPayableService],
})
export class VendorModule {}
