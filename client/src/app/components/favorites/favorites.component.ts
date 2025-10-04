import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Favorite } from '../../models/user.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Mijn Favorieten</h1>
          <p class="mt-2 text-sm text-gray-700">
            Jouw favoriete modules en cursussen.
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

      <!-- Favorites list -->
      <div *ngIf="!isLoading && favorites.length > 0" class="mt-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li *ngFor="let favorite of favorites" class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-lg font-medium text-indigo-600 truncate">
                      {{ favorite.module_name }}
                    </p>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {{ favorite.studycredit }} punten
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500">
                    <svg class="flex-shrink-0 mr-1.5 h-2 w-2 icon-xs" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    <p>{{ favorite.location }}</p>
                    <span class="mx-2">•</span>
                    <p>Toegevoegd op {{ favorite.added_at | date:'dd-MM-yyyy' }}</p>
                  </div>
                </div>
                <div class="ml-4">
                  <button
                    (click)="removeFromFavorites(favorite.module_id)"
                    [disabled]="isRemoving[favorite.module_id]"
                    class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="isRemoving[favorite.module_id]" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-2 w-2 text-red-700 icon-xs" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Bezig...
                    </span>
                    <span *ngIf="!isRemoving[favorite.module_id]" class="flex items-center">
                      <svg class="-ml-1 mr-2 h-2 w-2 icon-xs" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                        <path fill-rule="evenodd" d="M10 12a2 2 0 01-2-2V6a2 2 0 114 0v4a2 2 0 01-2 2z" clip-rule="evenodd"/>
                        <path d="M10 8a1 1 0 01-1-1V6a1 1 0 112 0v1a1 1 0 01-1 1z"/>
                      </svg>
                      Verwijderen
                    </span>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && favorites.length === 0 && !errorMessage" class="mt-8 text-center">
        <svg class="mx-auto h-2 w-2 text-gray-400 icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Geen favorieten</h3>
        <p class="mt-1 text-sm text-gray-500">Je hebt nog geen modules toegevoegd aan je favorieten.</p>
        <div class="mt-6">
          <a href="/modules" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="-ml-1 mr-1 h-2 w-2 icon-xs" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Modules bekijken
          </a>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isRemoving: { [key: string]: boolean } = {};

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.favorites = user.favorites || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van je favorieten';
        this.isLoading = false;
        console.error('Error loading favorites:', error);
      }
    });
  }

  removeFromFavorites(moduleId: string): void {
    this.isRemoving[moduleId] = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.removeFromFavorites(moduleId).subscribe({
      next: () => {
        this.isRemoving[moduleId] = false;
        this.favorites = this.favorites.filter(f => f.module_id !== moduleId);
        this.successMessage = 'Module succesvol verwijderd uit favorieten!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isRemoving[moduleId] = false;
        this.errorMessage = error.error?.message || 'Er is een fout opgetreden bij het verwijderen uit favorieten';
        setTimeout(() => this.errorMessage = '', 5000);
        console.error('Error removing from favorites:', error);
      }
    });
  }
}