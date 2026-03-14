import { Module } from '@nestjs/common';
import { HardwareAssetService } from './hardware-asset.service';
import { HardwareAssetController } from './hardware-asset.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HardwareAssetController],
  providers: [HardwareAssetService],
})
export class HardwareAssetModule {}
