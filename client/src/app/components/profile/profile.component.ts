import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-4" style="background-color: #ffffff; min-height: 100vh;">
      <div class="d-flex align-items-center mb-4">
        <div class="flex-grow-1">
          <h1 class="h2 fw-semibold text-dark mb-2">Mijn Profiel</h1>
          <p class="text-muted small">
            Beheer je persoonlijke informatie en account instellingen.
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

      <!-- Profile form -->
      <div *ngIf="!isLoading && user" class="mt-4">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h3 class="card-title h5 fw-semibold text-dark mb-4">
              Persoonlijke Informatie
            </h3>
            
            <!-- User name display -->
            <div class="mb-4">
              <div class="row">
                <div class="col-12">
                  <div class="d-flex align-items-center mb-3">
                    <span class="fw-medium me-2 text-muted">Naam:</span>
                    <span class="fs-6 text-dark">{{ user.firstname }} {{ user.lastname }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Editable email -->
            <form [formGroup]="emailForm" (ngSubmit)="updateEmail()">
              <div class="mb-4">
                <label for="email" class="form-label fw-medium text-muted">Email adres</label>
                <div class="input-group">
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="form-control"
                    [class.is-invalid]="emailForm.get('email')?.invalid && emailForm.get('email')?.touched"
                    placeholder="Email adres"
                  />
                  <button
                    type="submit"
                    [disabled]="emailForm.invalid || isUpdatingEmail || emailForm.get('email')?.value === user.email"
                    class="btn btn-success"
                    [class.btn-secondary]="isUpdatingEmail"
                  >
                    <span *ngIf="isUpdatingEmail">
                      Bezig...
                    </span>
                    <span *ngIf="!isUpdatingEmail">Bijwerken</span>
                  </button>
                </div>
                <div *ngIf="emailForm.get('email')?.invalid && emailForm.get('email')?.touched" 
                     class="invalid-feedback d-block">
                  <div *ngIf="emailForm.get('email')?.errors?.['required']">Email is verplicht</div>
                  <div *ngIf="emailForm.get('email')?.errors?.['email']">Voer een geldig email adres in</div>
                </div>
              </div>
            </form>

            <!-- Account info -->
            <div class="border-top pt-4">
              <h4 class="h6 fw-semibold text-dark mb-3">Account informatie</h4>
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="d-flex flex-column">
                    <span class="small fw-medium text-muted">Account aangemaakt</span>
                    <span class="small text-dark">{{ user.created_at | date:'dd MMMM yyyy' }}</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="d-flex flex-column">
                    <span class="small fw-medium text-muted">Laatst bijgewerkt</span>
                    <span class="small text-dark">{{ user.updated_at | date:'dd MMMM yyyy' }}</span>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="d-flex flex-column">
                    <span class="small fw-medium text-muted">Aantal favorieten</span>
                    <span class="small text-dark">{{ user.favorites?.length || 0 }} modules</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  emailForm: FormGroup;
  isLoading = false;
  isUpdatingEmail = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.emailForm.patchValue({ email: user.email });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van je profiel';
        this.isLoading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  updateEmail(): void {
    if (this.emailForm.valid && this.user) {
      this.isUpdatingEmail = true;
      this.errorMessage = '';
      this.successMessage = '';

      const newEmail = this.emailForm.get('email')?.value;

      this.userService.updateEmail(newEmail).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isUpdatingEmail = false;
          this.successMessage = 'Email adres succesvol bijgewerkt!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.isUpdatingEmail = false;
          this.errorMessage = error.error?.message || 'Er is een fout opgetreden bij het bijwerken van je email';
          setTimeout(() => this.errorMessage = '', 5000);
          console.error('Error updating email:', error);
        }
      });
    }
  }
}