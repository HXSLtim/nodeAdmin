import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueDevTokenDto {
  @ApiProperty({ description: 'Tenant identifier', example: 'tenant-abc-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  tenantId!: string;

  @ApiProperty({ description: 'User identifier to issue the token for', example: 'user-xyz-456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId!: string;

  @ApiPropertyOptional({
    description: 'Custom roles to embed in the dev token',
    example: ['admin', 'editor'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @IsOptional()
  roles?: string[];
}
