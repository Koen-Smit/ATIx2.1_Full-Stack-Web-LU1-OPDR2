import { Controller, Get, Param, Query, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { ModuleService } from '../../application/services/module.service';
import { ModuleResponseDto } from '../dto/module.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { Module } from '../../domain/entities/module.entity';

@Controller('api/modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllModules(): Promise<ModuleResponseDto[]> {
    try {
      const modules = await this.moduleService.getAllModules();
      return modules.map(module => this.mapToResponseDto(module));
    } catch {
      throw new HttpException('Failed to fetch modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getModuleById(@Param('id') id: string): Promise<ModuleResponseDto> {
    try {
      const module = await this.moduleService.getModuleById(id);
      return this.mapToResponseDto(module);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException('Module not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/name')
  async getModulesByName(@Query('name') name: string): Promise<ModuleResponseDto[]> {
    if (!name) {
      throw new HttpException('Name parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const modules = await this.moduleService.getModulesByName(name);
      return modules.map(module => this.mapToResponseDto(module));
    } catch {
      throw new HttpException('Failed to fetch modules by name', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/level')
  async getModulesByLevel(@Query('level') level: string): Promise<ModuleResponseDto[]> {
    if (!level) {
      throw new HttpException('Level parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const modules = await this.moduleService.getModulesByLevel(level);
      return modules.map(module => this.mapToResponseDto(module));
    } catch {
      throw new HttpException('Failed to fetch modules by level', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/location')
  async getModulesByLocation(@Query('location') location: string): Promise<ModuleResponseDto[]> {
    if (!location) {
      throw new HttpException('Location parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const modules = await this.moduleService.getModulesByLocation(location);
      return modules.map(module => this.mapToResponseDto(module));
    } catch {
      throw new HttpException('Failed to fetch modules by location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private mapToResponseDto(module: Module): ModuleResponseDto {
    return {
      id: module.id,
      name: module.name,
      shortdescription: module.shortDescription,
      description: module.description,
      content: module.content,
      studycredit: module.studyCredit,
      location: module.location,
      contact_id: module.contactId,
      level: module.level,
      learningoutcomes: module.learningOutcomes,
      created_at: module.createdAt,
      updated_at: module.updatedAt,
    };
  }
}