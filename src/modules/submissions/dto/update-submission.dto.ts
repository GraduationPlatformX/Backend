import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  grade?: number;
}
