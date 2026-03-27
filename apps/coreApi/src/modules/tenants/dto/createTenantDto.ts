import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @IsOptional()
  isActive?: boolean;
}
