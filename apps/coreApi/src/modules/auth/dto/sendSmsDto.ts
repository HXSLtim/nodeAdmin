import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;
}
