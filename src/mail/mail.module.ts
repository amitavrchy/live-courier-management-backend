import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailProcessor } from './mail.processor';
import { MailQueueService } from './mail.queue.service';
import { MailService } from './mail.service';
import { MAIL_QUEUE } from './mail.types';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? '127.0.0.1',
          port: Number(config.get<string>('REDIS_PORT') ?? 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [MailService, MailQueueService, MailProcessor],
  exports: [MailService, MailQueueService, BullModule],
})
export class MailModule {}
