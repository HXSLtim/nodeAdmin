import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Display name of the tenant organization',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: 'URL-friendly slug for the tenant', example: 'acme-corp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional({
    description: 'URL to the tenant logo image',
    example: 'https://cdn.example.com/logos/acme.png',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({ description: 'Whether the tenant is active upon creation', example: true })
  @IsOptional()
  isActive?: boolean;
}
