import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('Interceptor - URL:', req.url, 'Token present:', !!token);
  if (token) {
    console.log('Token value:', token.substring(0, 20) + '...');
  }

  if (token && req.url.includes('/api/')) {
    console.log('Adding Authorization header with token');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Headers after adding token:', authReq.headers.get('Authorization')?.substring(0, 20) + '...');
    
    return next(authReq).pipe(
      catchError(error => {
        if (error.status === 401 && !req.url.includes('/auth/')) {
          console.log('401 Unauthorized error on protected route, clearing session');
          authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  console.log('No token or not API request');
  return next(req);
};