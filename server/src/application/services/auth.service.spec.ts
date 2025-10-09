/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { LoginDto, RegisterDto } from '../../presentation/dto/auth.dto';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock.jwt.token'),
  verify: jest.fn(() => ({ email: 'test@example.com', sub: '123' })),
}));

import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = new User(
    '67890abcdef123456789012',
    'John',
    'Doe',
    'john.doe@example.com',
    '$2a$10$hashedpassword',
    [],
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
        AuthService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get('IUserRepository');

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are correct (happy path)', async () => {
      // Arrange
      const email = 'john.doe@example.com';
      const password = 'correctPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userWithHashedPassword = new User(
        mockUser._id,
        mockUser.firstname,
        mockUser.lastname,
        mockUser.email,
        hashedPassword,
        mockUser.favorites,
        mockUser.createdAt,
        mockUser.updatedAt
      );

      userRepository.findByEmail.mockResolvedValue(userWithHashedPassword);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.password).toBeUndefined(); // Password should be excluded
    });

    it('should return null when password is incorrect (unhappy path)', async () => {
      // Arrange
      const email = 'john.doe@example.com';
      const wrongPassword = 'wrongPassword123';
      const correctPassword = 'correctPassword123';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);
      
      const userWithHashedPassword = new User(
        mockUser._id,
        mockUser.firstname,
        mockUser.lastname,
        mockUser.email,
        hashedPassword,
        mockUser.favorites,
        mockUser.createdAt,
        mockUser.updatedAt
      );

      userRepository.findByEmail.mockResolvedValue(userWithHashedPassword);

      // Act
      const result = await service.validateUser(email, wrongPassword);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create new user and return access token (happy path)', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'Jane.Smith@Example.com', // Mixed case to test normalization
        password: 'password123',
      };

      const expectedUser = new User(
        '67890abcdef123456789013',
        'Jane',
        'Smith',
        'jane.smith@example.com', // Should be normalized to lowercase
        'hashedPassword123',
        [],
        new Date(),
        new Date()
      );

      userRepository.findByEmail.mockResolvedValue(null); // No existing user
      userRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith('jane.smith@example.com');
      expect(userRepository.create).toHaveBeenCalled();
      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user.firstname).toBe('Jane');
      expect(result.user.lastname).toBe('Smith');
      expect(result.user.email).toBe('jane.smith@example.com');
    });

    it('should throw ConflictException when email already exists (unhappy path)', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser); // User already exists

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid (happy path)', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'John.Doe@Example.com', // Mixed case to test normalization
        password: 'correctPassword123',
      };

      const hashedPassword = await bcrypt.hash('correctPassword123', 10);
      const userWithHashedPassword = new User(
        mockUser._id,
        mockUser.firstname,
        mockUser.lastname,
        mockUser.email,
        hashedPassword,
        mockUser.favorites,
        mockUser.createdAt,
        mockUser.updatedAt
      );

      userRepository.findByEmail.mockResolvedValue(userWithHashedPassword);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user.firstname).toBe('John');
      expect(result.user.email).toBe('john.doe@example.com');
    });

    it('should throw UnauthorizedException when user does not exist (unhappy path)', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null); // User not found

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw UnauthorizedException when password is incorrect (unhappy path)', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'wrongPassword123',
      };

      const correctPassword = 'correctPassword123';
      const hashedPassword = await bcrypt.hash(correctPassword, 10);
      const userWithHashedPassword = new User(
        mockUser._id,
        mockUser.firstname,
        mockUser.lastname,
        mockUser.email,
        hashedPassword,
        mockUser.favorites,
        mockUser.createdAt,
        mockUser.updatedAt
      );

      userRepository.findByEmail.mockResolvedValue(userWithHashedPassword);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded token when token is valid', () => {
      // Arrange
      const mockPayload = { email: 'john.doe@example.com', sub: '67890abcdef123456789012' };
      const validToken = 'valid.jwt.token';

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = service.verifyToken(validToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(validToken, expect.any(String));
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      // Arrange
      const invalidToken = 'invalid.jwt.token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => service.verifyToken(invalidToken)).toThrow(
        new UnauthorizedException('Invalid token')
      );

      expect(jwt.verify).toHaveBeenCalledWith(invalidToken, expect.any(String));
    });
  });
});