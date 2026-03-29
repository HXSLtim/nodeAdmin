import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenusService } from './menusService';
import { CreateMenuDto } from './dto/createMenuDto';
import { UpdateMenuDto } from './dto/updateMenuDto';
import { SetRoleMenusDto } from './dto/setRoleMenusDto';

@ApiTags('menus')
@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'List all menus' })
  async findAll() {
    return this.menusService.findAll();
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get menus assigned to a role' })
  async getRoleMenus(@Param('roleId') roleId: string) {
    return this.menusService.getRoleMenus(roleId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get menus visible to a user' })
  async getUserMenus(@Param('userId') userId: string, @Query('tenantId') tenantId?: string) {
    return this.menusService.getUserMenus(tenantId ?? 'default', userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  async findOne(@Param('id') id: string) {
    return this.menusService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menusService.create({
      parentId: dto.parentId,
      name: dto.name,
      path: dto.path,
      icon: dto.icon,
      sortOrder: dto.sortOrder,
      permissionCode: dto.permissionCode,
      isVisible: dto.isVisible,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, {
      parentId: dto.parentId,
      name: dto.name,
      path: dto.path,
      icon: dto.icon,
      sortOrder: dto.sortOrder,
      permissionCode: dto.permissionCode,
      isVisible: dto.isVisible,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item' })
  async remove(@Param('id') id: string) {
    await this.menusService.remove(id);
    return { success: true };
  }

  @Put('role/:roleId')
  @ApiOperation({ summary: 'Set menus for a role' })
  async setRoleMenus(@Param('roleId') roleId: string, @Body() dto: SetRoleMenusDto) {
    return this.menusService.setRoleMenus(roleId, dto.menuIds);
  }
}
