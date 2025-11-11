import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator"

export class SigninDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}