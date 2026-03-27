import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { MenusService } from './menusService';
import { CreateMenuDto } from './dto/createMenuDto';
import { UpdateMenuDto } from './dto/updateMenuDto';
import { SetRoleMenusDto } from './dto/setRoleMenusDto';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  async findAll() {
    return this.menusService.findAll();
  }

  @Get('role/:roleId')
  async getRoleMenus(@Param('roleId') roleId: string) {
    return this.menusService.getRoleMenus(roleId);
  }

  @Get('user/:userId')
  async getUserMenus(@Param('userId') userId: string, @Query('tenantId') tenantId?: string) {
    return this.menusService.getUserMenus(tenantId ?? 'default', userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.menusService.findById(id);
  }

  @Post()
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
  async remove(@Param('id') id: string) {
    await this.menusService.remove(id);
    return { success: true };
  }

  @Put('role/:roleId')
  async setRoleMenus(@Param('roleId') roleId: string, @Body() dto: SetRoleMenusDto) {
    return this.menusService.setRoleMenus(roleId, dto.menuIds);
  }
}
