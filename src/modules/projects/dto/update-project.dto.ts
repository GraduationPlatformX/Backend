import { ProjectStatus } from "@prisma/client";
import {
  IsOptional,
  IsString,
  IsArray,
  IsDate,
  IsDateString,
} from "class-validator";

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  technologies?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
