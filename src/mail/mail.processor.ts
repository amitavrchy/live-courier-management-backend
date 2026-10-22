import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { MAIL_QUEUE, SendEmailJobData } from './mail.types';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendEmailJobData>): Promise<{ messageId?: string }> {
    this.logger.log(
      `Processing mail job=${job.id} attempt=${job.attemptsMade + 1}`,
    );

    const result = await this.mailService.sendEmail(job.data);

    this.logger.log(
      `Mail job=${job.id} delivered messageId=${result.messageId ?? 'n/a'}`,
    );

    return result;
  }
}
