import { PaginationMeta } from '../dto/pagination.dto';

export type ApiSuccessEnvelope<T = unknown> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    requestId?: string;
    path?: string;
  };
  pagination?: PaginationMeta;
};

export type ApiErrorEnvelope = {
  success: false;
  statusCode: number;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId?: string;
    path?: string;
  };
};

/** Marker used by services/controllers for richer success payloads. */
export type ApiResult<T = unknown> = {
  __apiResult: true;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
};

export function ok<T>(
  data: T,
  message = 'Success',
  pagination?: PaginationMeta,
): ApiResult<T> {
  return {
    __apiResult: true,
    message,
    data,
    pagination,
  };
}

export function created<T>(
  data: T,
  message = 'Created successfully',
): ApiResult<T> {
  return ok(data, message);
}

export function isApiResult(value: unknown): value is ApiResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as ApiResult).__apiResult === true
  );
}
