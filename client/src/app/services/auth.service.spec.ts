import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '123',
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    favorites: [],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'mock.jwt.token',
    user: mockUser
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate'], { url: '/dashboard' });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login user successfully and set session (happy path)', () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'password123'
      };

      // Act
      service.login(loginRequest).subscribe(response => {
        // Assert
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('auth_token')).toBe('mock.jwt.token');
        expect(service.getCurrentUser()).toEqual(mockUser);
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockAuthResponse);
    });

    it('should handle login failure (unhappy path)', () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      // Act
      service.login(loginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401);
          expect(localStorage.getItem('auth_token')).toBeNull();
          expect(service.getCurrentUser()).toBeNull();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register user successfully and set session (happy path)', () => {
      // Arrange
      const registerRequest: RegisterRequest = {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123'
      };

      const expectedResponse: AuthResponse = {
        access_token: 'new.jwt.token',
        user: {
          ...mockUser,
          id: '456',
          firstname: 'Jane',
          lastname: 'Smith',
          email: 'jane.smith@example.com'
        }
      };

      // Act
      service.register(registerRequest).subscribe(response => {
        // Assert
        expect(response).toEqual(expectedResponse);
        expect(localStorage.getItem('auth_token')).toBe('new.jwt.token');
        expect(service.getCurrentUser()?.firstname).toBe('Jane');
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(expectedResponse);
    });

    it('should handle registration failure when email exists (unhappy path)', () => {
      // Arrange
      const registerRequest: RegisterRequest = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com', // Already existing email
        password: 'password123'
      };

      // Act
      service.register(registerRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(409);
          expect(localStorage.getItem('auth_token')).toBeNull();
          expect(service.getCurrentUser()).toBeNull();
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'User with this email already exists' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('logout', () => {
    it('should clear session and navigate to login', () => {
      // Arrange
      localStorage.setItem('auth_token', 'test.token');
      service['currentUserSubject'].next(mockUser);

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not navigate if already on login/register page', () => {
      // Arrange
      const routerOnLogin = jasmine.createSpyObj('Router', ['navigate'], { url: '/login' });
      (service as any).router = routerOnLogin;
      localStorage.setItem('auth_token', 'test.token');

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(routerOnLogin.navigate).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid token (happy path)', () => {
      // Arrange
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `header.${btoa(JSON.stringify({ exp: futureTimestamp }))}.signature`;
      localStorage.setItem('auth_token', validToken);

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for expired token (unhappy path)', () => {
      // Arrange
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = `header.${btoa(JSON.stringify({ exp: pastTimestamp }))}.signature`;
      localStorage.setItem('auth_token', expiredToken);

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when no token exists (unhappy path)', () => {
      // Arrange
      localStorage.removeItem('auth_token');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid token format (unhappy path)', () => {
      // Arrange
      localStorage.setItem('auth_token', 'invalid.token.format');

      // Act
      const result = service.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      // Arrange
      const testToken = 'test.jwt.token';
      localStorage.setItem('auth_token', testToken);

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBe(testToken);
    });

    it('should return null when no token exists', () => {
      // Arrange
      localStorage.removeItem('auth_token');

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      // Arrange
      service['currentUserSubject'].next(mockUser);

      // Act
      const result = service.getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is set', () => {
      // Arrange
      service['currentUserSubject'].next(null);

      // Act
      const result = service.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });
});