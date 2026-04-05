import { Controller, Get } from '@nestjs/common';

@Controller()
export class ExampleController {
  @Get('hello')
  hello() {
    return { message: 'Hello from Example Plugin!', timestamp: new Date().toISOString() };
  }

  @Get('status')
  status() {
    return { plugin: '@nodeadmin/plugin-example', version: '1.0.0', status: 'active' };
  }
}
