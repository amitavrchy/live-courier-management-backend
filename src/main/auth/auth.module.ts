import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Env } from '@/common/enum/env.enum';
import {
  DEFAULT_JWT_SECRET,
  JWT_STRATEGY_NAME,
  resolveJwtExpiresInSeconds,
} from '@/core/jwt/jwt.constants';
import { JwtStrategy } from '@/core/jwt/jwt.strategy';
import { LibModule } from '@/lib/lib.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    LibModule,
    PassportModule.register({ defaultStrategy: JWT_STRATEGY_NAME }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(Env.JWT_SECRET) ?? DEFAULT_JWT_SECRET,
        signOptions: {
          expiresIn: resolveJwtExpiresInSeconds(
            config.get<string>(Env.JWT_EXPIRES_IN),
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
