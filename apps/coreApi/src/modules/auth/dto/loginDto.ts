import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Registered email address', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ description: 'Account password', example: 'P@ssw0rd123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ description: 'Tenant identifier to log in to', example: 'tenant-abc-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  tenantId!: string;
}
