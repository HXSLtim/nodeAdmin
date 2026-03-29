import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenantsService';
import { CreateTenantDto } from './dto/createTenantDto';
import { UpdateTenantDto } from './dto/updateTenantDto';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  async list() {
    return this.tenantsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create({
      name: dto.name,
      slug: dto.slug,
      logo: dto.logo,
      isActive: dto.isActive,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, {
      name: dto.name,
      logo: dto.logo,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  async remove(@Param('id') id: string) {
    await this.tenantsService.remove(id);
    return { success: true };
  }
}
