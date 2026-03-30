import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MarkAsReadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  conversationId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  lastReadMessageId!: string;
}
