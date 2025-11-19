import { IsOptional, IsString, IsInt, Min, Max, IsArray } from 'class-validator';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsArray()
  feedback?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  grade?: number;
}
