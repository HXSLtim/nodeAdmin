import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class OAuthLoginDto {
  @IsString()
  @IsIn(['github', 'google'])
  provider!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}
