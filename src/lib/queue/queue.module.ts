import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env } from '@/common/enum/env.enum';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>(Env.REDIS_HOST) ?? '127.0.0.1',
          port: Number(config.get<string>(Env.REDIS_PORT) ?? 6379),
          password: config.get<string>(Env.REDIS_PASSWORD) || undefined,
          maxRetriesPerRequest: null,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
