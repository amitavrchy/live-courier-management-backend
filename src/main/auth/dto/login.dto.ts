import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'business.admin@andyesqo.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'BusinessAdmin@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
