import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient, User_Role, Employment_Type } from '@prisma/client';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function upsertAdmin(input: {
  email: string;
  password: string;
  fullName: string;
  employee_id: string;
  role: User_Role;
  tenantId: string | null;
  phone: string;
  depot: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  return prisma.users.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      password: passwordHash,
      role: input.role,
      tenantId: input.tenantId,
      phone: input.phone,
      depot: input.depot,
      status: 'ACTIVE',
    },
    create: {
      fullName: input.fullName,
      email: input.email,
      password: passwordHash,
      employee_id: input.employee_id,
      role: input.role,
      employmentType: Employment_Type.FULL_TIME,
      tenantId: input.tenantId,
      phone: input.phone,
      depot: input.depot,
      status: 'ACTIVE',
    },
  });
}

async function main() {
  const companyName =
    process.env.SEED_TENANT_NAME ?? 'AndYesQo Demo Tenant';

  const tenant = await prisma.tenantSettings.upsert({
    where: { id: process.env.SEED_TENANT_ID ?? '00000000-0000-4000-8000-000000000001' },
    update: { companyName },
    create: {
      id: process.env.SEED_TENANT_ID ?? '00000000-0000-4000-8000-000000000001',
      companyName,
      supportEmail: process.env.SEED_TENANT_SUPPORT_EMAIL ?? 'support@andyesqo.local',
    },
  });

  const platformEmail =
    process.env.SEED_PLATFORM_ADMIN_EMAIL ?? 'platform.admin@andyesqo.local';
  const platformPassword =
    process.env.SEED_PLATFORM_ADMIN_PASSWORD ?? 'PlatformAdmin@123';

  const businessEmail =
    process.env.SEED_BUSINESS_ADMIN_EMAIL ?? 'business.admin@andyesqo.local';
  const businessPassword =
    process.env.SEED_BUSINESS_ADMIN_PASSWORD ?? 'BusinessAdmin@123';

  const platformAdmin = await upsertAdmin({
    email: platformEmail,
    password: platformPassword,
    fullName: 'Platform Admin',
    employee_id: 'PLT-ADMIN-001',
    role: User_Role.PLATFORM_ADMIN,
    tenantId: null,
    phone: '1000000001',
    depot: 'HQ',
  });

  const businessAdmin = await upsertAdmin({
    email: businessEmail,
    password: businessPassword,
    fullName: 'Business Admin',
    employee_id: 'BIZ-ADMIN-001',
    role: User_Role.BUSINESS_ADMIN,
    tenantId: tenant.id,
    phone: '1000000002',
    depot: 'Sydney Central',
  });

  console.log('Seed complete');
  console.log({
    tenant: { id: tenant.id, companyName: tenant.companyName },
    platformAdmin: { id: platformAdmin.id, email: platformEmail, password: platformPassword },
    businessAdmin: { id: businessAdmin.id, email: businessEmail, password: businessPassword },
  });
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
