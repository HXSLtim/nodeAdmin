import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];
}
