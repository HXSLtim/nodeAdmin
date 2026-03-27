import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RolesService } from './rolesService';
import { CreateRoleDto } from './dto/createRoleDto';
import { UpdateRoleDto } from './dto/updateRoleDto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async list(@Query('tenantId') tenantId?: string) {
    return this.rolesService.list(tenantId ?? 'default');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    return this.rolesService.findById(tenantId ?? 'default', id);
  }

  @Post()
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto.tenantId, dto.name, dto.description, dto.permissionIds);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Query('tenantId') tenantId?: string
  ) {
    return this.rolesService.update(tenantId ?? 'default', id, {
      name: dto.name,
      description: dto.description,
      permissionIds: dto.permissionIds,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    await this.rolesService.remove(tenantId ?? 'default', id);
    return { success: true };
  }
}
