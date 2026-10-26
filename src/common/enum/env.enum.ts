/** Environment variable names used by this API. Values stay in the process environment. */
export enum Env {
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
  APP_LOGIN_URL = 'APP_LOGIN_URL',
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRES_IN = 'JWT_EXPIRES_IN',
  DATABASE_URL = 'DATABASE_URL',
  SMTP_HOST = 'SMTP_HOST',
  SMTP_PORT = 'SMTP_PORT',
  SMTP_USER = 'SMTP_USER',
  SMTP_PASS = 'SMTP_PASS',
  SMTP_FROM = 'SMTP_FROM',
  REDIS_HOST = 'REDIS_HOST',
  REDIS_PORT = 'REDIS_PORT',
  REDIS_PASSWORD = 'REDIS_PASSWORD',
}
