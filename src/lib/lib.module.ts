import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule, MailModule],
  exports: [PrismaModule, QueueModule, MailModule],
})
export class LibModule {}
