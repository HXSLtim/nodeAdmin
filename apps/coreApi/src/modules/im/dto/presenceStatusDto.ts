import { IsIn } from 'class-validator';

export class PresenceStatusDto {
  @IsIn(['online', 'away', 'dnd'])
  status!: 'away' | 'dnd' | 'online';
}
