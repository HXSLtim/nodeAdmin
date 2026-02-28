import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  conversationId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  messageId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  traceId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
