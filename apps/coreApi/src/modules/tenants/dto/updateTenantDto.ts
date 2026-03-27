import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @IsOptional()
  isActive?: boolean;
}
