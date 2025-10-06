import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = (window as any)?.env?.API_URL ? `${(window as any).env.API_URL}/users` : 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  updateEmail(email: string): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/email`, { email });
  }

  addToFavorites(moduleData: { module_id: string; module_name: string; studycredit: number; location: string }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/favorites`, moduleData);
  }

  removeFromFavorites(moduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/favorites/${moduleId}`);
  }
}