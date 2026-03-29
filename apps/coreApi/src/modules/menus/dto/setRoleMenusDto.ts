import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRoleMenusDto {
  @ApiProperty({
    description: 'Array of menu IDs to assign to the role',
    example: ['menu-001', 'menu-002', 'menu-003'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  menuIds!: string[];
}
