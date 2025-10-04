import { IsString, IsEmail, IsArray, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  favorites?: UserFavoriteDto[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  favorites?: UserFavoriteDto[];
}

export class UserResponseDto {
  firstname: string;
  lastname: string;
  email: string;
  favorites: UserFavoriteDto[];
  created_at: Date;
  updated_at: Date;
}

export class UserFavoriteDto {
  @IsString()
  module_id: string;

  @IsDateString()
  added_at: Date;

  @IsString()
  module_name: string;

  @IsNumber()
  studycredit: number;

  @IsString()
  location: string;
}