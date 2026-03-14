import { Module } from '@nestjs/common';
import { SoftwareLicenseController } from './software-license.controller';
import { SoftwareLicenseService } from './software-license.service';

@Module({
  controllers: [SoftwareLicenseController],
  providers: [SoftwareLicenseService],
  exports: [SoftwareLicenseService],
})
export class SoftwareLicenseModule {}
