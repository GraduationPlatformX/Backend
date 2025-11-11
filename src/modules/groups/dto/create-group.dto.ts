import { IsNotEmpty, IsString, IsOptional, IsIn, IsInt, IsNumber, Min, Max } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(6)
  maxMembers?: number;
}
