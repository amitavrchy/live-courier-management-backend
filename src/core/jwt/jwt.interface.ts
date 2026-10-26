import { User_Role } from '@prisma-gen';

export class AuthUser {
  id: string;
  email: string;
  role: User_Role;
  tenantId: string | null;
}

export type JwtPayload = {
  sub: string;
  email: string;
};
