import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleService } from '../../services/module.service';
import { UserService } from '../../services/user.service';
import { Module } from '../../models/module.model';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Modules</h1>
          <p class="mt-2 text-sm text-gray-700">
            Overzicht van alle beschikbare modules en cursussen.
          </p>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="mt-8 flex justify-center">
        <div class="animate-spin rounded-full h-2 w-2 border-b-2 border-indigo-600 icon-xs"></div>
      </div>

      <!-- Error state -->
      <div *ngIf="errorMessage" class="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="text-red-800">{{ errorMessage }}</div>
      </div>

      <!-- Success message -->
      <div *ngIf="successMessage" class="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
        <div class="text-green-800">{{ successMessage }}</div>
      </div>

      <!-- Modules grid -->
      <div *ngIf="!isLoading && modules.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let module of modules" class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
          <!-- Card Header -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">{{ module.name }}</h3>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                {{ module.level }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ module.shortdescription }}</p>
            
            <!-- Module Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-2 h-2 w-2 icon-xs text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ module.location }}</span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-2 h-2 w-2 icon-xs text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ module.studycredit }} studiepunten</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="px-6 pb-6">
            <button
              (click)="addToFavorites(module.id)"
              [disabled]="isAddingToFavorites[module.id]"
              class="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              <span *ngIf="isAddingToFavorites[module.id]" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-2 w-2 text-white icon-xs" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Toevoegen...
              </span>
              <span *ngIf="!isAddingToFavorites[module.id]" class="flex items-center">
                <svg class="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                </svg>
                Toevoegen aan favorieten
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && modules.length === 0 && !errorMessage" class="mt-8 text-center">
        <svg class="mx-auto h-2 w-2 text-gray-400 icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Geen modules gevonden</h3>
        <p class="mt-1 text-sm text-gray-500">Er zijn momenteel geen modules beschikbaar.</p>
      </div>
    </div>
  `
})
export class ModulesComponent implements OnInit {
  modules: Module[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAddingToFavorites: { [key: string]: boolean } = {};

  constructor(
    private moduleService: ModuleService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van de modules';
        this.isLoading = false;
        console.error('Error loading modules:', error);
      }
    });
  }

  addToFavorites(moduleId: string): void {
    this.isAddingToFavorites[moduleId] = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.addToFavorites(moduleId).subscribe({
      next: () => {
        this.isAddingToFavorites[moduleId] = false;
        this.successMessage = 'Module succesvol toegevoegd aan favorieten!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isAddingToFavorites[moduleId] = false;
        this.errorMessage = error.error?.message || 'Er is een fout opgetreden bij het toevoegen aan favorieten';
        setTimeout(() => this.errorMessage = '', 5000);
        console.error('Error adding to favorites:', error);
      }
    });
  }
}