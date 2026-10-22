import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiMetaDto {
  @ApiProperty({ example: '2026-10-06T09:00:00.000Z' })
  timestamp: string;

  @ApiPropertyOptional({ example: 'req_abc123' })
  requestId?: string;

  @ApiPropertyOptional({ example: '/api/v1/auth/login' })
  path?: string;
}

export class ApiErrorBodyDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiPropertyOptional({
    example: [{ field: 'email', message: 'email must be an email' }],
  })
  details?: unknown;
}

export class ApiSuccessResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: ApiMetaDto })
  meta?: ApiMetaDto;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ type: ApiErrorBodyDto })
  error: ApiErrorBodyDto;

  @ApiPropertyOptional({ type: ApiMetaDto })
  meta?: ApiMetaDto;
}
