import { Module } from '@nestjs/common';
import { VpsServerController } from './vps-server.controller';
import { VpsServerService } from './vps-server.service';

@Module({
  controllers: [VpsServerController],
  providers: [VpsServerService],
  exports: [VpsServerService],
})
export class VpsServerModule {}
