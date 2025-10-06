import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RegisterDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Wachtwoord moet minimaal 6 tekens bevatten' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/, {
    message: 'Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter, 1 cijfer en 1 speciaal teken (!@#$%^&*) bevatten'
  })
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
}