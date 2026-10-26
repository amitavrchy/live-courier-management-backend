export const JWT_STRATEGY_NAME = 'jwt';
export const DEFAULT_JWT_SECRET = 'dev-jwt-secret-change-me';
export const DEFAULT_JWT_EXPIRES_IN = '7d';

/** Seconds. Matches the previous ConfigService expiry parsing. */
export function resolveJwtExpiresInSeconds(
  expiresIn: string | undefined,
): number {
  const value = expiresIn ?? DEFAULT_JWT_EXPIRES_IN;

  if (value.endsWith('d')) {
    return Number.parseInt(value, 10) * 24 * 60 * 60;
  }

  return Number.parseInt(value, 10) || 60 * 60 * 24 * 7;
}
