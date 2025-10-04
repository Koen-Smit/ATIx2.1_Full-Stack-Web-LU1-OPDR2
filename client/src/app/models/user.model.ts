export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  favorites: Favorite[];
  created_at: Date;
  updated_at: Date;
}

export interface Favorite {
  module_id: string;
  added_at: Date;
  module_name: string;
  studycredit: number;
  location: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}