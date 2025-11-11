import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  deadline: string;

  
}
