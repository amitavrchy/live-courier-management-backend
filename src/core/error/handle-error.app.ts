import { Request } from 'express';
import { ApiErrorEnvelope } from '@/common/utils/response.util';
import { simplifyException } from './handle-error.simplify';

export type RequestWithId = Request & { requestId?: string };

export function buildErrorEnvelope(
  exception: unknown,
  request: RequestWithId,
): { statusCode: number; body: ApiErrorEnvelope } {
  const { statusCode, message, code, details } = simplifyException(exception);

  const body: ApiErrorEnvelope = {
    success: false,
    statusCode,
    message,
    error: {
      code,
      ...(details !== undefined ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      path: request.originalUrl ?? request.url,
    },
  };

  return { statusCode, body };
}
