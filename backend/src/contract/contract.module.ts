import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
