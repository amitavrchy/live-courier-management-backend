import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok } from '@/common';
import { AppService } from './app.service';
import { ApiMessage } from '@/core/decorator/api-message.decorator';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiMessage('Service is healthy')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'Service is up' })
  getHello() {
    return ok({
      status: 'ok',
      service: 'andyesqo-api',
      greeting: this.appService.getHello(),
    });
  }
}
