import { Module } from '@nestjs/common';
import { EmailAccountController } from './email-account.controller';
import { EmailAccountService } from './email-account.service';

@Module({
  controllers: [EmailAccountController],
  providers: [EmailAccountService],
  exports: [EmailAccountService],
})
export class EmailAccountModule {}
