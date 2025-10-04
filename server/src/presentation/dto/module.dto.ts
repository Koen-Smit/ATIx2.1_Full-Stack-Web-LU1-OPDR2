import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  shortdescription: string;

  @IsString()
  description: string;

  @IsString()
  content: string;

  @IsNumber()
  studycredit: number;

  @IsString()
  location: string;

  @IsString()
  contact_id: string;

  @IsString()
  level: string;

  @IsString()
  learningoutcomes: string;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  shortdescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  studycredit?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  contact_id?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  learningoutcomes?: string;
}

export class ModuleResponseDto {
  id: string;
  name: string;
  shortdescription: string;
  description: string;
  content: string;
  studycredit: number;
  location: string;
  contact_id: string;
  level: string;
  learningoutcomes: string;
  created_at: Date;
  updated_at: Date;
}