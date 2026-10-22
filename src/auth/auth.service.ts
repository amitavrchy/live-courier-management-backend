import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User_Role, User_Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { created, ok } from '../common';
import { MailQueueService } from '../mail/mail.queue.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const REGISTERABLE_ROLES: User_Role[] = [
  User_Role.SUPERVISOR,
  User_Role.FLEET_MANAGER,
  User_Role.ROSTER_MANAGER,
  User_Role.DRIVER,
  User_Role.ASSISTANT_DRIVER,
];

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailQueue: MailQueueService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.db.users.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.status !== User_Status.ACTIVE) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return ok(
      {
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
      'Login successful',
    );
  }

  async register(dto: RegisterDto, actor: AuthUser) {
    if (!REGISTERABLE_ROLES.includes(dto.role)) {
      throw new BadRequestException(
        'Only operational roles can be registered via this endpoint',
      );
    }

    if (!actor.tenantId) {
      throw new BadRequestException(
        'Business admin must belong to a tenant to register users',
      );
    }

    const email = dto.email.toLowerCase();

    const existing = await this.prisma.db.users.findFirst({
      where: {
        OR: [
          { email },
          { employee_id: dto.employee_id },
          { phone: dto.phone },
        ],
      },
      select: { email: true, employee_id: true, phone: true },
    });

    if (existing) {
      if (existing.email === email) {
        throw new ConflictException('Email is already registered');
      }
      if (existing.employee_id === dto.employee_id) {
        throw new ConflictException('Employee ID is already registered');
      }
      throw new ConflictException('Phone number is already registered');
    }

    const plainPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

    const user = await this.prisma.db.users.create({
      data: {
        fullName: dto.fullName,
        email,
        phone: dto.phone,
        password: passwordHash,
        employee_id: dto.employee_id,
        role: dto.role,
        employmentType: dto.employmentType,
        depot: dto.depot,
        tenantId: actor.tenantId,
        status: User_Status.ACTIVE,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        employee_id: true,
        role: true,
        employmentType: true,
        depot: true,
        tenantId: true,
        status: true,
        createdAt: true,
      },
    });

    const loginUrl =
      this.config.get<string>('APP_LOGIN_URL') ??
      `http://localhost:${this.config.get<string>('PORT') ?? 3001}/api/docs`;

    const { jobId } = await this.mailQueue.enqueueUserCredentials({
      fullName: user.fullName,
      email: user.email,
      password: plainPassword,
      loginUrl,
    });

    return created(
      {
        emailQueued: true,
        emailJobId: jobId,
        user,
      },
      'User created successfully. Login credentials will be emailed shortly.',
    );
  }

  private generatePassword(length = 12): string {
    const alphabet =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const bytes = randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i += 1) {
      password += alphabet[bytes[i] % alphabet.length];
    }
    return password;
  }
}
