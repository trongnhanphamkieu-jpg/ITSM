import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BudgetModule } from './budget/budget.module';
import { CostModule } from './cost/cost.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { VendorModule } from './vendor/vendor.module';
import { ContractModule } from './contract/contract.module';
import { NotificationModule } from './notification/notification.module';
import { SoftInventoryModule } from './soft-inventory/soft-inventory.module';
import { HardInventoryModule } from './hard-inventory/hard-inventory.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { ProjectModule } from './project/project.module';
import { CostForecastModule } from './cost-forecast/cost-forecast.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { ReportModule } from './reports/report.module';
import { AuditInterceptor } from './activity-log/audit.interceptor';
import { CacheModule } from './cache/cache.module';
import { HealthController } from './health.controller';
import { FileModule } from './file/file.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    CacheModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    BudgetModule,
    CostModule,
    DashboardModule,
    VendorModule,
    ContractModule,
    NotificationModule,
    SoftInventoryModule,
    HardInventoryModule,
    VehicleModule,
    ProjectModule,
    CostForecastModule,
    ActivityLogModule,
    ReportModule,
    FileModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
