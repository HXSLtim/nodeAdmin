import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './usersService';
import { CreateUserDto } from './dto/createUserDto';
import { UpdateUserDto } from './dto/updateUserDto';
import { ListUsersQueryDto } from './dto/listUsersQueryDto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Query() query: ListUsersQueryDto) {
    const tenantId = query.tenantId ?? 'default';
    return this.usersService.list(tenantId, query.page, query.pageSize, query.search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    return this.usersService.findById(tenantId ?? 'default', id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto.tenantId, dto.email, dto.password, dto.name, dto.roleIds);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Query('tenantId') tenantId?: string
  ) {
    return this.usersService.update(tenantId ?? 'default', id, {
      name: dto.name,
      avatar: dto.avatar,
      isActive: dto.isActive,
      roleIds: dto.roleIds,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    await this.usersService.remove(tenantId ?? 'default', id);
    return { success: true };
  }
}
