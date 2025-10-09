/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully (happy path)', () => {
      const registerData = {
        firstname: 'Integration',
        lastname: 'Test',
        email: `integration.test.${Date.now()}@example.com`, // Unique email
        password: 'password123'
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('access_token');
          expect(response.body.user.firstname).toBe('Integration');
          expect(response.body.user.email).toBe(registerData.email.toLowerCase());
        });
    });

    it('should fail when registering with existing email (unhappy path)', async () => {
      const registerData = {
        firstname: 'Duplicate',
        lastname: 'Test',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // First registration should succeed
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      // Second registration with same email should fail
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData)
        .expect(409)
        .expect((response) => {
          expect(response.body.message).toContain('already exists');
        });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const registerData = {
        firstname: 'Login',
        lastname: 'Test',
        email: 'login.test@example.com',
        password: 'password123'
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData);
    });

    it('should login with correct credentials (happy path)', () => {
      const loginData = {
        email: 'login.test@example.com',
        password: 'password123'
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)
        .expect((response) => {
          expect(response.body).toHaveProperty('access_token');
          expect(response.body.user.email).toBe('login.test@example.com');
        });
    });

    it('should fail with incorrect credentials (unhappy path)', () => {
      const loginData = {
        email: 'login.test@example.com',
        password: 'wrongpassword'
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail with non-existent user (unhappy path)', () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toContain('Invalid credentials');
        });
    });
  });
});