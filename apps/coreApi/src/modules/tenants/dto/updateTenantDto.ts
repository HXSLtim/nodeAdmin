import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'Updated display name of the tenant',
    example: 'Acme Corporation Ltd.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated URL to the tenant logo',
    example: 'https://cdn.example.com/logos/acme-new.png',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({ description: 'Whether the tenant account is active', example: true })
  @IsOptional()
  isActive?: boolean;
}
