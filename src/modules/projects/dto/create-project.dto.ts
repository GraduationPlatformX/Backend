import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDate,
  IsDateString,
} from "class-validator";

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  technologies?: string[];

  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
