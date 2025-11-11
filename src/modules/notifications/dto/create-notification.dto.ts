import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsInt()
  userId: number;
}
