import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';
import { API_MESSAGE_KEY } from '../constants';
import { ApiSuccessEnvelope, isApiResult } from '../http/api-result';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessEnvelope> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { requestId?: string }>();
    const response = http.getResponse<Response>();

    const decoratorMessage = this.reflector.getAllAndOverride<string>(
      API_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((payload) => {
        const statusCode = response.statusCode || 200;
        const timestamp = new Date().toISOString();
        const meta = {
          timestamp,
          requestId: request.requestId,
          path: request.originalUrl ?? request.url,
        };

        if (isApiResult(payload)) {
          return {
            success: true as const,
            statusCode,
            message: payload.message ?? decoratorMessage ?? 'Success',
            data: payload.data,
            meta,
            ...(payload.pagination ? { pagination: payload.pagination } : {}),
          };
        }

        // Controllers that already return { message, ...data }
        if (
          payload &&
          typeof payload === 'object' &&
          !Array.isArray(payload) &&
          'message' in payload &&
          typeof (payload as { message: unknown }).message === 'string'
        ) {
          const { message, ...rest } = payload as {
            message: string;
            [key: string]: unknown;
          };
          const data =
            'data' in rest && Object.keys(rest).length === 1
              ? rest.data
              : Object.keys(rest).length > 0
                ? rest
                : null;

          return {
            success: true as const,
            statusCode,
            message: message || decoratorMessage || 'Success',
            data,
            meta,
          };
        }

        return {
          success: true as const,
          statusCode,
          message: decoratorMessage ?? defaultMessage(statusCode),
          data: payload ?? null,
          meta,
        };
      }),
    );
  }
}

function defaultMessage(statusCode: number): string {
  if (statusCode === 201) return 'Created successfully';
  if (statusCode === 204) return 'No content';
  return 'Success';
}
