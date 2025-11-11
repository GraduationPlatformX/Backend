import { MilestoneStatus } from '@prisma/client';
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;
}
