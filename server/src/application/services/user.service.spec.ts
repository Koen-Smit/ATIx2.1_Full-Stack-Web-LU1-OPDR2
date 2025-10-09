/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserFavorite } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockFavorite = new UserFavorite(
    'module123',
    new Date('2024-01-01'),
    'Test Module',
    5,
    'Breda'
  );

  const mockUser = new User(
    '67890abcdef123456789012',
    'John',
    'Doe',
    'john.doe@example.com',
    'hashedpassword123',
    [],
    new Date('2024-01-01'),
    new Date('2024-01-01')
  );

  const mockUserWithFavorites = new User(
    '67890abcdef123456789012',
    'John',
    'Doe',
    'john.doe@example.com',
    'hashedpassword123',
    [mockFavorite],
    new Date('2024-01-01'),
    new Date('2024-01-01')
  );

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('addToFavorites (business logic test)', () => {
    it('should add module to favorites successfully (happy path)', async () => {
      // Arrange
      const userId = '67890abcdef123456789012';
      const newFavorite = new UserFavorite(
        'module456',
        new Date(),
        'New Module',
        3,
        'Tilburg'
      );

      userRepository.findById.mockResolvedValue(mockUser);
      
      const expectedUpdatedUser = mockUser.addFavorite(newFavorite);
      userRepository.update.mockResolvedValue(expectedUpdatedUser);

      // Act
      const updatedUserData = { favorites: expectedUpdatedUser.favorites };
      const result = await service.updateUser(userId, updatedUserData);

      // Assert
      expect(userRepository.findById).not.toHaveBeenCalled(); // updateUser doesn't call findById
      expect(userRepository.update).toHaveBeenCalledWith(userId, updatedUserData);
      expect(result.favorites).toHaveLength(1);
      expect(result.favorites[0].moduleId).toBe('module456');
      expect(result.favorites[0].moduleName).toBe('New Module');
    });

    it('should handle duplicate favorite addition (unhappy path)', async () => {
      // Arrange
      const userId = '67890abcdef123456789012';
      const duplicateFavorite = new UserFavorite(
        'module123', // Same moduleId as existing favorite
        new Date(),
        'Test Module',
        5,
        'Breda'
      );

      userRepository.findById.mockResolvedValue(mockUserWithFavorites);
      
      // When adding duplicate, the User entity will handle it (business logic in entity)
      const userWithDuplicateAttempt = mockUserWithFavorites.addFavorite(duplicateFavorite);
      userRepository.update.mockResolvedValue(userWithDuplicateAttempt);

      // Act
      const updatedUserData = { favorites: userWithDuplicateAttempt.favorites };
      const result = await service.updateUser(userId, updatedUserData);

      // Assert
      expect(userRepository.update).toHaveBeenCalledWith(userId, updatedUserData);
      expect(result).toBeDefined();
    });
  });

  describe('updateUser', () => {
    it('should update user email with normalization (happy path)', async () => {
      // Arrange
      const userId = '67890abcdef123456789012';
      const updateData = { email: 'JOHN.DOE@EXAMPLE.COM' }; // Uppercase email
      
      const expectedUser = new User(
        userId,
        mockUser.firstname,
        mockUser.lastname,
        'john.doe@example.com', // Should be normalized to lowercase
        mockUser.password,
        mockUser.favorites,
        mockUser.createdAt,
        new Date()
      );

      userRepository.update.mockResolvedValue(expectedUser);

      // Act
      const result = await service.updateUser(userId, updateData);

      // Assert
      expect(userRepository.update).toHaveBeenCalledWith(userId, { 
        email: 'john.doe@example.com' 
      });
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should throw NotFoundException when user does not exist (unhappy path)', async () => {
      // Arrange
      const userId = 'nonexistent123';
      const updateData = { firstname: 'UpdatedName' };

      userRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateUser(userId, updateData)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );

      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('getUserById', () => {
    it('should return user when found (happy path)', async () => {
      // Arrange
      const userId = '67890abcdef123456789012';
      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
      expect(result.firstname).toBe('John');
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should throw NotFoundException when user not found (unhappy path)', async () => {
      // Arrange
      const userId = 'nonexistent123';
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email (happy path)', async () => {
      // Arrange
      const email = 'john.doe@example.com';
      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserByEmail(email);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
      expect(result.email).toBe(email);
    });

    it('should throw NotFoundException when user not found by email (unhappy path)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserByEmail(email)).rejects.toThrow(
        new NotFoundException(`User with email ${email} not found`)
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('createUser', () => {
    it('should create new user successfully (happy path)', async () => {
      // Arrange
      const userData = {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        password: 'hashedpassword456',
        favorites: [],
        getFullName: () => 'Jane Smith',
        addFavorite: (favorite: UserFavorite) => new User('', '', '', '', '', [], new Date(), new Date()),
        removeFavorite: (moduleId: string) => new User('', '', '', '', '', [], new Date(), new Date()),
      };

      const expectedUser = new User(
        'generatedId123',
        'Jane',
        'Smith',
        'jane.smith@example.com',
        'hashedpassword456',
        [],
        new Date(),
        new Date()
      );

      userRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
      expect(result.firstname).toBe('Jane');
      expect(result.email).toBe('jane.smith@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully (happy path)', async () => {
      // Arrange
      const userId = '67890abcdef123456789012';
      userRepository.delete.mockResolvedValue(true);

      // Act
      await service.deleteUser(userId);

      // Assert
      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user to delete not found (unhappy path)', async () => {
      // Arrange
      const userId = 'nonexistent123';
      userRepository.delete.mockResolvedValue(false);

      // Act & Assert
      await expect(service.deleteUser(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`)
      );

      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
});