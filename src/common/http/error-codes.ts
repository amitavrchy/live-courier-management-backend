export function mapHttpStatusToCode(status: number): string {
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

export function normalizeExceptionMessage(message: string | string[]): string {
  if (Array.isArray(message)) {
    return message[0] ?? 'Request failed';
  }
  return message || 'Request failed';
}
