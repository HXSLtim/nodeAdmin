import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SetRoleMenusDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  menuIds!: string[];
}
