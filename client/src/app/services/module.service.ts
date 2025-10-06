import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Module } from '../models/module.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private readonly API_URL = (window as any)?.env?.API_URL ? `${(window as any).env.API_URL}/modules` : 'http://localhost:3000/api/modules';

  constructor(private http: HttpClient) {}

  getAllModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.API_URL);
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.API_URL}/${id}`);
  }

  getModulesByName(name: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.API_URL}/search/name?name=${name}`);
  }

  getModulesByLevel(level: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.API_URL}/search/level?level=${level}`);
  }

  getModulesByLocation(location: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.API_URL}/search/location?location=${location}`);
  }
}