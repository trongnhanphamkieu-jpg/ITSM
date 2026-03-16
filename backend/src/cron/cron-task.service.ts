import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CronTaskService {
  private readonly logger = new Logger(CronTaskService.name);

  constructor(private notificationService: NotificationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'payment-overdue-check' })
  async handlePaymentOverdue() {
    this.logger.log('Checking overdue payments...');
    try {
      const result = await this.notificationService.checkPaymentOverdue();
      this.logger.log(`Overdue check: ${result.overdue} costs, ${result.notified} notifications`);
    } catch (err) {
      this.logger.error('Payment overdue check failed', err);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'contract-expiry-check' })
  async handleContractExpiry() {
    this.logger.log('Checking contract expiry...');
    try {
      const result = await this.notificationService.checkContractExpiry();
      this.logger.log(`Expiry check: ${result.checked} contracts, ${result.notified} admins`);
    } catch (err) {
      this.logger.error('Contract expiry check failed', err);
    }
  }
}
