import { Logger } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RequestWithId } from './request-id.middleware';

const logger = new Logger('HTTP');

export function loggerMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction,
): void {
  const started = Date.now();

  res.on('finish', () => {
    logger.log(
      `${req.method} ${req.originalUrl ?? req.url} ${res.statusCode} ${Date.now() - started}ms ${req.requestId ?? ''}`.trim(),
    );
  });

  next();
}
