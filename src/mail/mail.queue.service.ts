import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import {
  buildCredentialsEmailHtml,
  buildCredentialsEmailText,
  CredentialsEmailParams,
} from './templates/credentials.email';
import { MAIL_QUEUE, SendEmailJobData } from './mail.types';

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 200,
};

@Injectable()
export class MailQueueService {
  private readonly logger = new Logger(MailQueueService.name);

  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  /** Universal enqueue — any email shape. */
  async enqueue(
    data: SendEmailJobData,
    options?: JobsOptions,
  ): Promise<{ jobId: string }> {
    const job = await this.mailQueue.add('send-email', data, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });

    this.logger.log(
      `Queued email job=${job.id} → to=${Array.isArray(data.to) ? data.to.join(',') : data.to} subject="${data.subject}"`,
    );

    return { jobId: String(job.id) };
  }

  /** Convenience helper for registration credentials emails. */
  async enqueueUserCredentials(
    params: CredentialsEmailParams,
  ): Promise<{ jobId: string }> {
    return this.enqueue({
      to: params.email,
      subject: 'Your AndYesQo login credentials',
      html: buildCredentialsEmailHtml(params),
      text: buildCredentialsEmailText(params),
    });
  }
}
