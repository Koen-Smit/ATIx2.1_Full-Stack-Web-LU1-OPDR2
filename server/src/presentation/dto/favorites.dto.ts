import { IsString, IsNumber } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  module_id: string;

  @IsString()
  module_name: string;

  @IsNumber()
  studycredit: number;

  @IsString()
  location: string;
}

export class RemoveFavoriteDto {
  @IsString()
  module_id: string;
}

export class UpdateEmailDto {
  @IsString()
  email: string;
}