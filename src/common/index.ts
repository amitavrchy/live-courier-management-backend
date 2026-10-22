export { CommonModule } from './common.module';
export { ApiMessage } from './decorators/api-message.decorator';
export {
  ApiErrorResponseDto,
  ApiSuccessResponseDto,
} from './dto/api-response.dto';
export {
  PaginationQueryDto,
  buildPaginationMeta,
  getSkipTake,
} from './dto/pagination.dto';
export type { PaginationMeta } from './dto/pagination.dto';
export { created, ok } from './http/api-result';
export type { ApiResult } from './http/api-result';
