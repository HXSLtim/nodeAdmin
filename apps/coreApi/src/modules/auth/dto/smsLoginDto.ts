import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SmsLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  code!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}
