import { Controller, Get, Param } from '@nestjs/common';
import { PermissionsService } from './permissionsService';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':module')
  async findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }
}
