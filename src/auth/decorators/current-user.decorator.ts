import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User_Role } from '@prisma/client';

export class AuthUser {
  id: string;
  email: string;
  role: User_Role;
  tenantId: string | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
