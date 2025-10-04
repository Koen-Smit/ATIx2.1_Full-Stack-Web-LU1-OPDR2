import { Controller, Get, Param, Query, HttpStatus, HttpException, UseGuards, Request, Post, Body, Put, Delete } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { UserResponseDto } from '../dto/user.dto';
import { AddFavoriteDto, UpdateEmailDto } from '../dto/favorites.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { User, UserFavorite } from 'src/domain/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Protected endpoints
  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getCurrentUser(@Request() req: AuthenticatedRequest): UserResponseDto {
    try {
      const user = req.user; // user is attached by JWT guard
      return this.mapToResponseDto(user);
    } catch {
      throw new HttpException('Failed to fetch user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('email')
  async updateEmail(@Request() req: AuthenticatedRequest, @Body() updateEmailDto: UpdateEmailDto): Promise<UserResponseDto> {
    try {
      const userId = req.user._id;
      const updatedUser = await this.userService.updateUser(userId, { email: updateEmailDto.email });
      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to update email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites')
  async addFavorite(@Request() req: AuthenticatedRequest, @Body() addFavoriteDto: AddFavoriteDto): Promise<UserResponseDto> {
    try {
      const userId = req.user._id;
      const user = await this.userService.getUserById(userId);
      
      const newFavorite = new UserFavorite(
        addFavoriteDto.module_id,
        new Date(),
        addFavoriteDto.module_name,
        addFavoriteDto.studycredit,
        addFavoriteDto.location,
      );

      const updatedUser = user.addFavorite(newFavorite);
      const savedUser = await this.userService.updateUser(userId, { favorites: updatedUser.favorites });
      
      return this.mapToResponseDto(savedUser);
    } catch {
      throw new HttpException('Failed to add favorite', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:moduleId')
  async removeFavorite(@Request() req: AuthenticatedRequest, @Param('moduleId') moduleId: string): Promise<UserResponseDto> {
    try {
      const userId = req.user._id;
      const user = await this.userService.getUserById(userId);
      
      const updatedUser = user.removeFavorite(moduleId);
      const savedUser = await this.userService.updateUser(userId, { favorites: updatedUser.favorites });
      
      return this.mapToResponseDto(savedUser);
    } catch {
      throw new HttpException('Failed to remove favorite', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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