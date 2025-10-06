import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModuleService } from '../../services/module.service';
import { UserService } from '../../services/user.service';
import { Module } from '../../models/module.model';

interface FilterState {
  searchTerm: string;
  location: string;
  studycredit: string;
  level: string;
  sortBy: string;
}

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-4" style="background-color: #ffffff; min-height: 100vh;">
      <div class="d-flex align-items-center mb-4">
        <div class="flex-grow-1">
          <h1 class="h2 fw-semibold text-dark mb-2">Modules</h1>
          <p class="text-muted small">
            Overzicht van alle beschikbare modules en cursussen.
          </p>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm">
            <!-- Search Bar -->
            <div class="row mb-3">
              <div class="col-12 col-md-8">
                <div class="input-group">
                  <input type="text" 
                         class="form-control" 
                         placeholder="Zoek op modulenaam..." 
                         formControlName="searchTerm">
                  <button class="btn btn-primary" type="button" (click)="performSearch()">
                    Zoeken
                  </button>
                </div>
              </div>
              <div class="col-12 col-md-4 mt-2 mt-md-0">
                <button type="button" 
                        class="btn btn-outline-secondary w-100" 
                        (click)="toggleFilters()">
                  <span *ngIf="!showFilters">Filters tonen</span>
                  <span *ngIf="showFilters">Filters verbergen</span>
                </button>
              </div>
            </div>

            <!-- Advanced Filters -->
            <div *ngIf="showFilters" class="row g-3">
              <div class="col-12 col-md-3">
                <label class="form-label small fw-medium">Locatie</label>
                <select class="form-select" formControlName="location">
                  <option value="">Alle locaties</option>
                  <option *ngFor="let location of availableLocations" [value]="location">{{ location }}</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label small fw-medium">Studiepunten</label>
                <select class="form-select" formControlName="studycredit">
                  <option value="">Alle studiepunten</option>
                  <option *ngFor="let credit of availableStudyCredits" [value]="credit">{{ credit }} punten</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label small fw-medium">Niveau</label>
                <select class="form-select" formControlName="level">
                  <option value="">Alle niveaus</option>
                  <option *ngFor="let level of availableLevels" [value]="level">{{ level }}</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label small fw-medium">Sorteren op</label>
                <select class="form-select" formControlName="sortBy">
                  <option value="name-asc">Naam (A-Z)</option>
                  <option value="name-desc">Naam (Z-A)</option>
                  <option value="studycredit-asc">Studiepunten (laag-hoog)</option>
                  <option value="studycredit-desc">Studiepunten (hoog-laag)</option>
                </select>
              </div>
              <div class="col-12">
                <button type="button" 
                        class="btn btn-outline-danger btn-sm" 
                        (click)="clearFilters()">
                  Filters wissen
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Results count -->
      <div *ngIf="!isLoading" class="mb-3">
        <small class="text-muted">
          {{ filteredModules.length }} van {{ modules.length }} modules
        </small>
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

      <!-- Modules grid -->
      <div *ngIf="!isLoading && filteredModules.length > 0" class="row mt-4 g-4">
        <div *ngFor="let module of filteredModules" class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border">
            <!-- Card Header -->
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title fw-semibold text-dark me-3" style="line-height: 1.3;">{{ module.name }}</h5>
                <span class="badge bg-primary rounded-pill small">
                  {{ module.level }}
                </span>
              </div>
              
              <p class="card-text text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">{{ module.shortdescription }}</p>
              
              <!-- Module Details -->
              <div class="mb-3">
                <div class="d-flex align-items-center small text-muted mb-1">
                  <span class="fw-medium me-1">Locatie:</span>
                  <span>{{ module.location }}</span>
                </div>
                <div class="d-flex align-items-center small text-muted">
                  <span class="fw-medium me-1">Studiepunten:</span>
                  <span>{{ module.studycredit }}</span>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer bg-white border-0 pt-0">
              <button
                (click)="toggleFavorite(module.id)"
                [disabled]="isAddingToFavorites[module.id]"
                class="btn w-100"
                [class.btn-success]="!isInFavorites(module.id) && !isAddingToFavorites[module.id]"
                [class.btn-primary]="isInFavorites(module.id) && !isAddingToFavorites[module.id]"
                [class.btn-secondary]="isAddingToFavorites[module.id]"
              >
              <span *ngIf="isAddingToFavorites[module.id]">
                Bezig...
              </span>
              <span *ngIf="!isAddingToFavorites[module.id] && !isInFavorites(module.id)">
                Opslaan
              </span>
              <span *ngIf="!isAddingToFavorites[module.id] && isInFavorites(module.id)">
                Naar favorieten
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && filteredModules.length === 0 && modules.length > 0" class="text-center mt-4">
        <h5 class="fw-medium text-dark">Geen modules gevonden</h5>
        <p class="text-muted small">Geen modules voldoen aan de huidige zoekcriteria. Probeer de filters aan te passen.</p>
      </div>

      <!-- No modules at all -->
      <div *ngIf="!isLoading && modules.length === 0 && !errorMessage" class="text-center mt-4">
        <h5 class="fw-medium text-dark">Geen modules beschikbaar</h5>
        <p class="text-muted small">Er zijn momenteel geen modules beschikbaar.</p>
      </div>
    </div>
  `
})
export class ModulesComponent implements OnInit {
  modules: Module[] = [];
  filteredModules: Module[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAddingToFavorites: { [key: string]: boolean } = {};
  userFavorites: Set<string> = new Set();
  showFilters = false;
  
  filterForm: FormGroup;
  availableLocations: string[] = [];
  availableStudyCredits: number[] = [];
  availableLevels: string[] = [];

  constructor(
    private moduleService: ModuleService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      location: [''],
      studycredit: [''],
      level: [''],
      sortBy: ['name-asc']
    });
  }

  ngOnInit(): void {
    this.loadModules();
    this.loadUserFavorites();
  }

  loadModules(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        this.filteredModules = [...modules];
        this.extractFilterOptions();
        this.applyFilters();
        this.setupFormSubscription();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van de modules';
        this.isLoading = false;
        console.error('Error loading modules:', error);
      }
    });
  }

  private setupFormSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private extractFilterOptions(): void {
    const locations = new Set<string>();
    const studyCredits = new Set<number>();
    const levels = new Set<string>();

    this.modules.forEach(module => {
      if (module.location) locations.add(module.location);
      if (module.studycredit) studyCredits.add(module.studycredit);
      if (module.level) levels.add(module.level);
    });

    this.availableLocations = Array.from(locations).sort();
    this.availableStudyCredits = Array.from(studyCredits).sort((a, b) => a - b);
    this.availableLevels = Array.from(levels).sort();
  }

  private applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.modules];


    // Apply search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      console.log('Searching for:', searchTerm);
      filtered = filtered.filter(module => 
        module.name.toLowerCase().includes(searchTerm) ||
        module.shortdescription.toLowerCase().includes(searchTerm)
      );
    }

    // Apply location filter
    if (filters.location && filters.location.trim()) {
      filtered = filtered.filter(module => module.location === filters.location);
    }

    // Apply study credit filter
    if (filters.studycredit && filters.studycredit.trim()) {
      filtered = filtered.filter(module => module.studycredit.toString() === filters.studycredit);
    }

    // Apply level filter
    if (filters.level && filters.level.trim()) {
      filtered = filtered.filter(module => module.level === filters.level);
    }

    // Apply sorting
    this.applySorting(filtered, filters.sortBy || 'name-asc');

    this.filteredModules = filtered;
  }

  private applySorting(modules: Module[], sortBy: string): void {
    switch (sortBy) {
      case 'name-asc':
        modules.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        modules.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'studycredit-asc':
        modules.sort((a, b) => a.studycredit - b.studycredit);
        break;
      case 'studycredit-desc':
        modules.sort((a, b) => b.studycredit - a.studycredit);
        break;
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  performSearch(): void {
    const searchTerm = this.filterForm.get('searchTerm')?.value;
    
    if (!searchTerm || !searchTerm.trim()) {
      this.filteredModules = [...this.modules];
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    
    this.filteredModules = this.modules.filter(module => 
      module.name.toLowerCase().includes(searchTermLower)
    );
    
    const sortBy = this.filterForm.get('sortBy')?.value || 'name-asc';
    this.applySorting(this.filteredModules, sortBy);
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      location: '',
      studycredit: '',
      level: '',
      sortBy: 'name-asc'
    });
  }

  addToFavorites(moduleId: string): void {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) {
      this.errorMessage = 'Module niet gevonden';
      return;
    }

    if (this.isInFavorites(moduleId)) {
      this.errorMessage = 'Module staat al in favorieten';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const moduleData = {
      module_id: module.id,
      module_name: module.name,
      studycredit: module.studycredit,
      location: module.location
    };

    this.isAddingToFavorites[moduleId] = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.addToFavorites(moduleData).subscribe({
      next: () => {
        this.isAddingToFavorites[moduleId] = false;
        this.userFavorites.add(moduleId); // Update local state
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

  loadUserFavorites(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user.favorites) {
          this.userFavorites = new Set(user.favorites.map((fav: any) => fav.module_id));
        }
      },
      error: (error) => {
        console.error('Error loading user favorites:', error);
      }
    });
  }

  isInFavorites(moduleId: string): boolean {
    return this.userFavorites.has(moduleId);
  }

  toggleFavorite(moduleId: string): void {
    if (this.isInFavorites(moduleId)) {
      // Module is already in favorites, navigate to favorites page
      this.router.navigate(['/favorites']);
      return;
    }
    
    // Module is not in favorites, add it
    this.addToFavorites(moduleId);
  }
}