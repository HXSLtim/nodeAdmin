import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissionsService';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':module')
  @ApiOperation({ summary: 'List permissions by module' })
  async findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }
}
