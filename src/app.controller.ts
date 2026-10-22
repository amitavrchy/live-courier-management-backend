import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiMessage, ok } from './common';

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
