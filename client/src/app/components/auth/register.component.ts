import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { strongPasswordValidator } from '../../validators/password.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center py-5" style="background-color: #ffffff;">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="text-center mb-4">
              <h2 class="fw-bold">Account aanmaken</h2>
              <p class="text-muted">
                Of
                <a routerLink="/login" class="text-decoration-none">
                  log in met een bestaand account
                </a>
              </p>
            </div>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="needs-validation" novalidate>
              <div class="mb-3">
                <label for="firstname" class="form-label">Voornaam</label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  formControlName="firstname"
                  class="form-control"
                  [class.is-invalid]="registerForm.get('firstname')?.invalid && registerForm.get('firstname')?.touched"
                  placeholder="Voornaam"
                />
                <div *ngIf="registerForm.get('firstname')?.invalid && registerForm.get('firstname')?.touched" 
                     class="invalid-feedback">
                  <div *ngIf="registerForm.get('firstname')?.errors?.['required']">Voornaam is verplicht</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="lastname" class="form-label">Achternaam</label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  required
                  formControlName="lastname"
                  class="form-control"
                  [class.is-invalid]="registerForm.get('lastname')?.invalid && registerForm.get('lastname')?.touched"
                  placeholder="Achternaam"
                />
                <div *ngIf="registerForm.get('lastname')?.invalid && registerForm.get('lastname')?.touched" 
                     class="invalid-feedback">
                  <div *ngIf="registerForm.get('lastname')?.errors?.['required']">Achternaam is verplicht</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">E-mailadres</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  formControlName="email"
                  class="form-control"
                  [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  placeholder="E-mailadres"
                />
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                     class="invalid-feedback">
                  <div *ngIf="registerForm.get('email')?.errors?.['required']">E-mailadres is verplicht</div>
                  <div *ngIf="registerForm.get('email')?.errors?.['email']">Voer een geldig e-mailadres in</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Wachtwoord</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  formControlName="password"
                  class="form-control"
                  [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  placeholder="Wachtwoord"
                />
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                     class="invalid-feedback">
                  <div *ngIf="registerForm.get('password')?.errors?.['required']">Wachtwoord is verplicht</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['minLength']">Wachtwoord moet minimaal 6 tekens bevatten</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['missingUppercase']">Wachtwoord moet minimaal 1 hoofdletter bevatten</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['missingLowercase']">Wachtwoord moet minimaal 1 kleine letter bevatten</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['missingNumber']">Wachtwoord moet minimaal 1 cijfer bevatten</div>
                  <div *ngIf="registerForm.get('password')?.errors?.['missingSpecialChar']">Wachtwoord moet minimaal 1 speciaal teken bevatten (!@#$%^&*)</div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  [disabled]="registerForm.invalid || isLoading"
                  class="btn btn-primary"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? 'Account wordt aangemaakt...' : 'Account aanmaken' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/modules']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Er is een fout opgetreden bij het aanmaken van het account';
        }
      });
    }
  }
}