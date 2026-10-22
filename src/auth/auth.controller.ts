import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User_Role } from '@prisma/client';
import { ApiMessage } from '../common';
import { AuthService } from './auth.service';
import { AuthUser, CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Login successful')
  @ApiOperation({ summary: 'Login and receive a JWT access token' })
  @ApiOkResponse({ description: 'Authenticated successfully' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(User_Role.BUSINESS_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiMessage('User created successfully. Login credentials will be emailed shortly.')
  @ApiOperation({
    summary: 'Register a user (Business Admin only)',
    description:
      'Creates a user under the admin tenant, generates a temporary password, and queues a credentials email.',
  })
  @ApiCreatedResponse({ description: 'User created and credentials email queued' })
  register(@Body() dto: RegisterDto, @CurrentUser() user: AuthUser) {
    return this.authService.register(dto, user);
  }
}
