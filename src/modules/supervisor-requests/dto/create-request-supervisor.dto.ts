import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSupervisorRequestDto {
    @IsNotEmpty()
    @IsNumber()
    supervisorId: number;

    @IsNotEmpty()
    @IsNumber()
    groupId: number;

    @IsString()
    @IsOptional()
    message?: string;
}