import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiErrorEnvelope } from '../http/api-result';
import {
  mapHttpStatusToCode,
  normalizeExceptionMessage,
} from '../http/error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const { statusCode, message, code, details } =
      this.resolveException(exception);

    if (statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

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

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    code: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
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
      const isValidation =
        statusCode === HttpStatus.BAD_REQUEST && Array.isArray(obj.message);

      return {
        statusCode,
        message: isValidation
          ? 'Validation failed'
          : normalizeExceptionMessage(rawMessage),
        code: obj.code ?? (isValidation ? 'VALIDATION_ERROR' : mapHttpStatusToCode(statusCode)),
        details: isValidation
          ? this.formatValidationDetails(obj.message as string[])
          : obj.details,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    };
  }

  private formatValidationDetails(messages: string[]) {
    return messages.map((message) => {
      const field = message.split(' ')[0];
      return { field, message };
    });
  }

  private mapPrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
    code: string;
    details?: unknown;
  } {
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
}
