import { Role } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
