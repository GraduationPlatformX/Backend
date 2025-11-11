import { Role } from '@prisma/client';
import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;


  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
