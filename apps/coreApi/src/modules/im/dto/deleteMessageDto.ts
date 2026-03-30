import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  conversationId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  messageId!: string;
}
