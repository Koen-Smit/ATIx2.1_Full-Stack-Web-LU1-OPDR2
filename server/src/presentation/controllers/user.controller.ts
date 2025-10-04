import { Controller, Get, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { UserResponseDto } from '../dto/user.dto';

import { User, UserFavorite } from 'src/domain/entities/user.entity';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      console.log('UserController.getAllUsers() called');
      const users = await this.userService.getAllUsers();
      console.log(`Found ${users.length} users`);
      const result = users.map(user => this.mapToResponseDto(user));
      console.log('Mapped users to DTO successfully');
      return result;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userService.getUserById(id);
      return this.mapToResponseDto(user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search/email')
  async getUserByEmail(@Query('email') email: string): Promise<UserResponseDto> {
    if (!email) {
      throw new HttpException('Email parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const user = await this.userService.getUserByEmail(email);
      return this.mapToResponseDto(user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      favorites: user.favorites.map((fav: UserFavorite) => ({
        module_id: fav.moduleId,
        added_at: fav.addedAt,
        module_name: fav.moduleName,
        studycredit: fav.studyCredit,
        location: fav.location,
      })),
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}