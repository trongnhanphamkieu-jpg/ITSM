import { Module } from '@nestjs/common';
import { InfraResourceService } from './infra-resource.service';
import { InfraResourceController } from './infra-resource.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InfraResourceController],
  providers: [InfraResourceService],
})
export class InfraResourceModule {}
