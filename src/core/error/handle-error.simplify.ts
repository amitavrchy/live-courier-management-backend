import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma-gen';

export type SimplifiedError = {
  statusCode: number;
  message: string;
  code: string;
  details?: unknown;
};

export function simplifyException(exception: unknown): SimplifiedError {
  if (exception instanceof HttpException) {
    return simplifyHttpException(exception);
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    return mapPrismaError(exception);
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  };
}

function simplifyHttpException(exception: HttpException): SimplifiedError {
  const statusCode = exception.getStatus();
  const res = exception.getResponse();

  if (typeof res === 'string') {
    return {
      statusCode,
      message: res,
      code: mapHttpStatusToCode(statusCode),
    };
  }

  const obj = res as {
    message?: string | string[];
    error?: string;
    code?: string;
    details?: unknown;
  };

  const rawMessage = obj.message ?? exception.message;
  const isValidation = statusCode === 400 && Array.isArray(obj.message);

  return {
    statusCode,
    message: isValidation
      ? 'Validation failed'
      : normalizeExceptionMessage(rawMessage),
    code:
      obj.code ??
      (isValidation ? 'VALIDATION_ERROR' : mapHttpStatusToCode(statusCode)),
    details: isValidation
      ? formatValidationDetails(obj.message as string[])
      : obj.details,
  };
}

function mapHttpStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    default:
      return `HTTP_${status}`;
  }
}

function normalizeExceptionMessage(message: string | string[]): string {
  if (Array.isArray(message)) {
    return message[0] ?? 'Request failed';
  }
  return message || 'Request failed';
}

function formatValidationDetails(messages: string[]) {
  return messages.map((message) => {
    const field = message.split(' ')[0];
    return { field, message };
  });
}

function mapPrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): SimplifiedError {
  switch (error.code) {
    case 'P2002':
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with this value already exists',
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        details: { target: error.meta?.target },
      };
    case 'P2025':
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        code: 'RECORD_NOT_FOUND',
      };
    default:
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Database request failed',
        code: `PRISMA_${error.code}`,
        details: error.meta,
      };
  }
}
