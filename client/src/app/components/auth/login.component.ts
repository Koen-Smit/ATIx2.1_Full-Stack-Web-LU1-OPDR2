import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="text-center mb-4">
              <h2 class="fw-bold">Inloggen</h2>
              <p class="text-muted">
                Of
                <a routerLink="/register" class="text-decoration-none">
                  maak een nieuw account aan
                </a>
              </p>
            </div>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="needs-validation" novalidate>
              <div class="mb-3">
                <label for="email" class="form-label">Email adres</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  formControlName="email"
                  class="form-control"
                  [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="Email adres"
                />
                <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                     class="invalid-feedback">
                  <div *ngIf="loginForm.get('email')?.errors?.['required']">E-mailadres is verplicht</div>
                  <div *ngIf="loginForm.get('email')?.errors?.['email']">Voer een geldig e-mailadres in</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Wachtwoord</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  formControlName="password"
                  class="form-control"
                  [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Wachtwoord"
                />
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                     class="invalid-feedback">
                  <div *ngIf="loginForm.get('password')?.errors?.['required']">Wachtwoord is verplicht</div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  [disabled]="loginForm.invalid || isLoading"
                  class="btn btn-primary"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? 'Bezig met inloggen...' : 'Inloggen' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/modules']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Er is een fout opgetreden bij het inloggen';
        }
      });
    }
  }
}