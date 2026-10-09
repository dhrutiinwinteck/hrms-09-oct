/**
 * @file login.types.ts
 * @description Type definitions for authentication.
 * @version 2.0.0
 */

export interface LoginCredentials {
  emp_code: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  access_token: string;
  token_type: string;
}

export interface AuthState {
  isAuthenticated: boolean;
}