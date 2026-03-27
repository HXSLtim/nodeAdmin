import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  @MaxLength(128)
  parentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  path?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  permissionCode?: string;

  @IsOptional()
  isVisible?: boolean;
}
