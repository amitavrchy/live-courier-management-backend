import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Employment_Type, User_Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    example: 'Amit Roy',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    example: 'amit@example.com',
    description: 'Unique email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'EMP-001',
    description: 'Unique employee ID',
  })
  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({
    enum: User_Role,
    example: User_Role.DRIVER,
    description:
      'Role assigned to the user. Admin roles cannot be created via this endpoint.',
    enumName: 'User_Role',
  })
  @IsEnum(User_Role)
  role: User_Role;

  @ApiProperty({
    example: '545454541',
    description: 'Unique Phone Number',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'Sydney Central',
    description: 'Depot',          
  })
  @IsString()
  @IsNotEmpty()
  depot: string;

  @ApiProperty({
    enum: Employment_Type,
    example: Employment_Type.FULL_TIME,
    description: 'Employment type of the user',
  })
  @IsEnum(Employment_Type)
  employmentType: Employment_Type;
}
