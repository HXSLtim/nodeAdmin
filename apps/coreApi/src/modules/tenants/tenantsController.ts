import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TenantsService } from './tenantsService';
import { CreateTenantDto } from './dto/createTenantDto';
import { UpdateTenantDto } from './dto/updateTenantDto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async list() {
    return this.tenantsService.list();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create({
      name: dto.name,
      slug: dto.slug,
      logo: dto.logo,
      isActive: dto.isActive,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, {
      name: dto.name,
      logo: dto.logo,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tenantsService.remove(id);
    return { success: true };
  }
}
