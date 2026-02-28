import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinConversationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  conversationId!: string;
}
