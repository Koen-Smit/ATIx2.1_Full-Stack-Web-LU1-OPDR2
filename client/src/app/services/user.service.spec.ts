import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '123',
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    favorites: [
      {
        module_id: 'module123',
        added_at: new Date('2024-01-01'),
        module_name: 'Test Module',
        studycredit: 5,
        location: 'Breda'
      }
    ],
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('addToFavorites', () => {
    it('should add module to favorites successfully (happy path)', () => {
      // Arrange
      const moduleData = {
        module_id: 'module456',
        module_name: 'New Module',
        studycredit: 3,
        location: 'Tilburg'
      };

      // Act
      service.addToFavorites(moduleData).subscribe(response => {
        // Assert
        expect(response).toBeNull(); // Void response returns null
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users/favorites');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(moduleData);
      req.flush(null); // Void response
    });

    it('should handle adding duplicate favorite (unhappy path)', () => {
      // Arrange
      const duplicateModuleData = {
        module_id: 'module123', // Same as existing favorite
        module_name: 'Test Module',
        studycredit: 5,
        location: 'Breda'
      };

      // Act
      service.addToFavorites(duplicateModuleData).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(409); // Conflict status
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users/favorites');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Module already in favorites' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove favorite successfully (happy path)', () => {
      // Arrange
      const moduleId = 'module123';

      // Act
      service.removeFromFavorites(moduleId).subscribe(response => {
        // Assert
        expect(response).toBeNull(); // Void response returns null
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`http://localhost:3000/api/users/favorites/${moduleId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null); // Void response
    });

    it('should handle removing non-existent favorite (unhappy path)', () => {
      // Arrange
      const nonExistentModuleId = 'nonexistent456';

      // Act
      service.removeFromFavorites(nonExistentModuleId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(404); // Not found status
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`http://localhost:3000/api/users/favorites/${nonExistentModuleId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Favorite not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateEmail', () => {
    it('should update email successfully (happy path)', () => {
      // Arrange
      const newEmail = 'newemail@example.com';
      const updatedUser: User = {
        ...mockUser,
        email: newEmail,
        updated_at: new Date()
      };

      // Act
      service.updateEmail(newEmail).subscribe(response => {
        // Assert
        expect(response).toEqual(updatedUser);
        expect(response.email).toBe(newEmail);
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users/email');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ email: newEmail });
      req.flush(updatedUser);
    });

    it('should handle email already in use (unhappy path)', () => {
      // Arrange
      const existingEmail = 'existing@example.com';

      // Act
      service.updateEmail(existingEmail).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(409); // Conflict status
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users/email');
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Email already in use' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully (happy path)', () => {
      // Act
      service.getProfile().subscribe(response => {
        // Assert
        expect(response).toEqual(mockUser);
        expect(response.email).toBe('john.doe@example.com');
        expect(response.favorites.length).toBe(1);
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users/profile');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle unauthorized access (unhappy path)', () => {
      // Act
      service.getProfile().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(401); // Unauthorized
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users/profile');
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully (happy path)', () => {
      // Arrange
      const userId = '123';

      // Act
      service.getUserById(userId).subscribe(response => {
        // Assert
        expect(response).toEqual(mockUser);
        expect(response.id).toBe(userId);
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`http://localhost:3000/api/users/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle user not found (unhappy path)', () => {
      // Arrange
      const nonExistentUserId = 'nonexistent456';

      // Act
      service.getUserById(nonExistentUserId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(404); // Not found
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne(`http://localhost:3000/api/users/${nonExistentUserId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully (happy path)', () => {
      // Arrange
      const mockUsers: User[] = [mockUser, { ...mockUser, id: '456', email: 'jane@example.com' }];

      // Act
      service.getAllUsers().subscribe(response => {
        // Assert
        expect(response).toEqual(mockUsers);
        expect(response.length).toBe(2);
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle server error (unhappy path)', () => {
      // Act
      service.getAllUsers().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          // Assert
          expect(error.status).toBe(500); // Internal server error
        }
      });

      // Assert HTTP request
      const req = httpMock.expectOne('http://localhost:3000/api/users');
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});