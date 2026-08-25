import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('email-queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing background email job: ${job.name} (ID: ${job.id})`);

    try {
      switch (job.name) {
        case 'send-project-approval':
          await this.mailService.sendProjectApprovalDirect(job.data);
          break;

        case 'send-invoice-created':
          await this.mailService.sendInvoiceCreatedDirect(job.data);
          break;

        case 'send-payment-receipt':
          await this.mailService.sendPaymentReceiptDirect(job.data);
          break;

        case 'send-activity-notice':
          await this.mailService.sendActivityNoticeDirect(job.data);
          break;

        default:
          this.logger.warn(`Unknown email job type: ${job.name}`);
      }
      return { completed: true };
    } catch (error: any) {
      this.logger.error(`Error processing email job ${job.name}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
