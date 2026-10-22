import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN') ?? '7d';
        return {
          secret: config.get<string>('JWT_SECRET') ?? 'dev-jwt-secret-change-me',
          signOptions: {
            // seconds — avoids jwt StringValue typing friction with ConfigService
            expiresIn:
              expiresIn.endsWith('d')
                ? Number.parseInt(expiresIn, 10) * 24 * 60 * 60
                : Number.parseInt(expiresIn, 10) || 60 * 60 * 24 * 7,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
