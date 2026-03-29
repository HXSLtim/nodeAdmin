import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiPropertyOptional({ description: 'ID of the parent menu item', example: 'menu-parent-001' })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Updated display name of the menu item',
    example: 'User Management',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Updated route path', example: '/settings/users' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  path?: string;

  @ApiPropertyOptional({ description: 'Updated icon identifier', example: 'TeamOutlined' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({ description: 'Updated sort order', example: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Updated permission code', example: 'users:manage' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  permissionCode?: string;

  @ApiPropertyOptional({ description: 'Whether the menu item is visible', example: false })
  @IsOptional()
  isVisible?: boolean;
}
