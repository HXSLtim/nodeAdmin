import { IsNotEmpty, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Name of the role', example: 'Editor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the role purpose',
    example: 'Can edit and publish content',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Tenant identifier to create the role in',
    example: 'tenant-abc-123',
  })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiPropertyOptional({
    description: 'IDs of permissions to grant to this role',
    example: ['perm-read-001', 'perm-write-002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
