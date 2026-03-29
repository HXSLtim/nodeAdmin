import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiPropertyOptional({
    description: 'ID of the parent menu item (null for root level)',
    example: 'menu-parent-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  parentId?: string;

  @ApiProperty({ description: 'Display name of the menu item', example: 'User Management' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Route path the menu links to', example: '/settings/users' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  path?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier for the menu item',
    example: 'UserOutlined',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Sort order for menu display (lower values appear first)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Permission code required to view this menu',
    example: 'users:read',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  permissionCode?: string;

  @ApiPropertyOptional({
    description: 'Whether the menu item is visible in the sidebar',
    example: true,
  })
  @IsOptional()
  isVisible?: boolean;
}
