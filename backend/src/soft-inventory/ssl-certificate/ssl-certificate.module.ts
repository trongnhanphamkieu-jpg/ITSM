import { Module } from '@nestjs/common';
import { SslCertificateController } from './ssl-certificate.controller';
import { SslCertificateService } from './ssl-certificate.service';

@Module({
  controllers: [SslCertificateController],
  providers: [SslCertificateService],
  exports: [SslCertificateService],
})
export class SslCertificateModule {}
