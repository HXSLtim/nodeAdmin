import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the account to reset',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ description: 'New password (minimum 8 characters)', example: 'N3wP@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;

  @ApiProperty({ description: 'Tenant identifier', example: 'tenant-abc-123' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}
