import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../../package.json');

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check', security: [] })
  getHealth(): { service: string; status: string; timestamp: string; version: string } {
    return {
      service: 'coreApi',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: pkg.version,
    };
  }
}
