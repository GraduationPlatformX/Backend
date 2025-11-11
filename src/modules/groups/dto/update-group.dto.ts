import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(6)
  maxMembers?: number;
}
