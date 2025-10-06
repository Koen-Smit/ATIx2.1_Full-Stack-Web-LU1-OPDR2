import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = (window as any)?.env?.API_URL ? `${(window as any).env.API_URL}/auth` : 'http://localhost:3000/api/auth';
  private readonly USER_API_URL = (window as any)?.env?.API_URL ? `${(window as any).env.API_URL}/users` : 'http://localhost:3000/api/users';
  private readonly TOKEN_KEY = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private initialized = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  private initializeAuth(): void {
    this.loadUserFromToken();
    this.initialized = true;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    if (!this.router.url.includes('/login') && !this.router.url.includes('/register')) {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return false;
    }
    
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      console.log('Invalid token payload');
      return false;
    }
    
    const isValid = payload.exp > Date.now() / 1000;
    console.log('Token valid:', isValid, 'Expires:', new Date(payload.exp * 1000));
    return isValid;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResponse: AuthResponse): void {
    console.log('Setting session with token:', authResponse.access_token ? 'Present' : 'Missing');
    localStorage.setItem(this.TOKEN_KEY, authResponse.access_token);
    this.currentUserSubject.next(authResponse.user);
  }

  private loadUserFromToken(): void {
    console.log('loadUserFromToken called');
    const token = this.getToken();
    console.log('Token exists:', !!token);
    
    if (token && this.isAuthenticated()) {
      console.log('Token is valid, loading user data');
      
      
      console.log('Attempting to load complete user profile');
      this.loadUserProfile().subscribe({
        next: (user) => {
          console.log('Successfully loaded complete profile');
          // Successfully loaded complete profile
          this.currentUserSubject.next(user);
        },
        error: (error) => {
          console.log('Failed to load user profile from token:', error);
          // Only logout if it's a 401 (unauthorized) error - token is invalid
          if (error.status === 401) {
            console.log('Token is invalid (401), logging out');
            this.logout();
          } else {
            console.log('Network or other error, keeping user logged in');
            if (!this.currentUserSubject.value) {
              const payload = this.decodeToken(token);
              if (payload && payload.email) {
                setTimeout(() => {
                  this.loadUserProfile().subscribe({
                    next: (user) => {
                      this.currentUserSubject.next(user);
                    },
                    error: () => {
                      this.currentUserSubject.next({
                        id: payload.sub || '',
                        firstname: payload.firstname || 'Loading...',
                        lastname: payload.lastname || '',
                        email: payload.email,
                        favorites: [],
                        created_at: new Date(),
                        updated_at: new Date()
                      });
                    }
                  });
                }, 1000);
              }
            }
          }
        }
      });
    } else {
      console.log('No valid token found');
    }
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private loadUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.USER_API_URL}/profile`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }
}