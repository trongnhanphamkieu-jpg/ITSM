import { Module } from '@nestjs/common';
import { EmailAccountModule } from './email-account/email-account.module';
import { DomainModule } from './domain/domain.module';
import { VpsServerModule } from './vps-server/vps-server.module';
import { SoftwareLicenseModule } from './software-license/software-license.module';
import { SslCertificateModule } from './ssl-certificate/ssl-certificate.module';

@Module({
  imports: [
    EmailAccountModule,
    DomainModule,
    VpsServerModule,
    SoftwareLicenseModule,
    SslCertificateModule,
  ],
})
export class SoftInventoryModule {}
