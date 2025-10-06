import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-vh-100" style="background-color: #ffffff;">
      <!-- Navigation -->
      <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #f8f9fa; border-bottom: 1px solid #e9ecef;">
        <div class="container">
          <a class="navbar-brand fw-bold" routerLink="/modules">Module Systeem</a>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" [attr.aria-expanded]="false">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/modules" routerLinkActive="active">Modules</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/favorites" routerLinkActive="active">Favorieten</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/profile" routerLinkActive="active">Profiel</a>
              </li>
            </ul>
            <div class="d-flex">
              <div class="dropdown">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <ng-container *ngIf="user$ | async as user; else noUser">
                    {{ user.firstname }} {{ user.lastname }}
                  </ng-container>
                  <ng-template #noUser>Loading...</ng-template>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" routerLink="/profile">Profiel</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item" (click)="logout()">Uitloggen</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <main class="container py-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  user$!: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}