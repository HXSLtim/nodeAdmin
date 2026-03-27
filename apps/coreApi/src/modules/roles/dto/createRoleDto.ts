import { IsNotEmpty, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
