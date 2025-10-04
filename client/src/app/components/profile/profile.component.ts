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
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Mijn Profiel</h1>
          <p class="mt-2 text-sm text-gray-700">
            Beheer je persoonlijke informatie en account instellingen.
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

      <!-- Profile form -->
      <div *ngIf="!isLoading && user" class="mt-8">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Persoonlijke Informatie
            </h3>
            
            <!-- Read-only information -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Voornaam</label>
                <div class="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {{ user.firstname }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Achternaam</label>
                <div class="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {{ user.lastname }}
                </div>
              </div>
            </div>

            <!-- Editable email -->
            <form [formGroup]="emailForm" (ngSubmit)="updateEmail()">
              <div class="mb-6">
                <label for="email" class="block text-sm font-medium text-gray-700">Email adres</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Email adres"
                  />
                  <button
                    type="submit"
                    [disabled]="emailForm.invalid || isUpdatingEmail || emailForm.get('email')?.value === user.email"
                    class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span *ngIf="isUpdatingEmail" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-1 h-2 w-2 icon-xs" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Bezig...
                    </span>
                    <span *ngIf="!isUpdatingEmail">Bijwerken</span>
                  </button>
                </div>
                <div *ngIf="emailForm.get('email')?.invalid && emailForm.get('email')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  <div *ngIf="emailForm.get('email')?.errors?.['required']">Email is verplicht</div>
                  <div *ngIf="emailForm.get('email')?.errors?.['email']">Voer een geldig email adres in</div>
                </div>
              </div>
            </form>

            <!-- Account info -->
            <div class="border-t border-gray-200 pt-6">
              <h4 class="text-md font-medium text-gray-900 mt-3 mb-3">Account informatie</h4>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span class="text-sm font-medium text-gray-500">Account aangemaakt</span>
                  <p class="text-sm text-gray-900">{{ user.created_at | date:'dd MMMM yyyy' }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Laatst bijgewerkt</span>
                  <p class="text-sm text-gray-900">{{ user.updated_at | date:'dd MMMM yyyy' }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500">Aantal favorieten</span>
                  <p class="text-sm text-gray-900">{{ user.favorites?.length || 0 }} modules</p>
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