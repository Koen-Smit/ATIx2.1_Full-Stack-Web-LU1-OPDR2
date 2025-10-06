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
    <div class="container-fluid p-4" style="background-color: #ffffff; min-height: 100vh;">
      <div class="d-flex align-items-center mb-4">
        <div class="flex-grow-1">
          <h1 class="h2 fw-semibold text-dark mb-2">Mijn Favorieten</h1>
          <p class="text-muted small">
            Jouw favoriete modules en cursussen.
          </p>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="text-center mt-4">
        <div class="text-muted">Laden...</div>
      </div>

      <!-- Error state -->
      <div *ngIf="errorMessage" class="alert alert-danger mt-4">
        <div>{{ errorMessage }}</div>
      </div>

      <!-- Success message -->
      <div *ngIf="successMessage" class="alert alert-success mt-4">
        <div>{{ successMessage }}</div>
      </div>

      <!-- Favorites list -->
      <div *ngIf="!isLoading && favorites.length > 0" class="mt-4">
        <div class="row g-3">
          <div *ngFor="let favorite of favorites" class="col-12">
            <div class="card shadow-sm border rounded">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="flex-grow-1 me-3">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <h5 class="card-title mb-0 fw-semibold text-primary">
                        {{ favorite.module_name }}
                      </h5>
                      <div class="ms-2">
                        <span class="badge bg-success rounded-pill">
                          Studiepunten: {{ favorite.studycredit }}
                        </span>
                      </div>
                    </div>
                    <div class="d-flex align-items-center small text-muted">
                      <span class="fw-medium me-1">Locatie:</span>
                      <span>{{ favorite.location }}</span>
                      <span class="mx-2">•</span>
                      <span>Toegevoegd op {{ favorite.added_at | date:'dd-MM-yyyy' }}</span>
                    </div>
                  </div>
                  <div class="ms-3">
                    <button
                      (click)="removeFromFavorites(favorite.module_id)"
                      [disabled]="isRemoving[favorite.module_id]"
                      class="btn btn-outline-danger btn-sm"
                    >
                      <span *ngIf="isRemoving[favorite.module_id]">
                        Bezig...
                      </span>
                      <span *ngIf="!isRemoving[favorite.module_id]">
                        Verwijderen
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && favorites.length === 0 && !errorMessage" class="text-center mt-4">
        <h5 class="fw-medium text-dark">Geen favorieten</h5>
        <p class="text-muted small">Je hebt nog geen modules toegevoegd aan je favorieten.</p>
        <div class="mt-3">
          <a href="/modules" class="btn btn-primary">
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