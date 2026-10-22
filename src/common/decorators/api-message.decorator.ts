import { SetMetadata } from '@nestjs/common';
import { API_MESSAGE_KEY } from '../constants';

/** Override the default success message for an endpoint. */
export const ApiMessage = (message: string) =>
  SetMetadata(API_MESSAGE_KEY, message);
