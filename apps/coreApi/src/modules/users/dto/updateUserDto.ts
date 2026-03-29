import { IsOptional, IsString, MaxLength, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Updated display name', example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'URL to the user avatar image',
    example: 'https://cdn.example.com/avatars/jane.png',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ description: 'Whether the user account is active', example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'IDs of roles to assign to the user',
    example: ['role-admin-001'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];
}
