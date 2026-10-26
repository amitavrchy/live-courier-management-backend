import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueModule } from '@/lib/queue/queue.module';
import { MailProcessor } from './services/mail.processor';
import { MailQueueService } from './services/mail-queue.service';
import { MailService } from './mail.service';
import { MAIL_QUEUE } from './mail.types';

@Module({
  imports: [
    QueueModule,
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [MailService, MailQueueService, MailProcessor],
  exports: [MailService, MailQueueService],
})
export class MailModule {}
