// /**
//  * @file authStorage.ts
//  * @description Utilities for persisting authentication state and JWT token.
//  * @version 2.0.0
//  */

// import { AUTH_STORAGE_KEY } from '../constants/login.constants';

// const ACCESS_TOKEN_KEY = 'accessToken';

// /**
//  * Get the stored access token.
//  */
// export const getToken = (): string | null => {
//   try {
//     return localStorage.getItem(ACCESS_TOKEN_KEY);
//   } catch {
//     return null;
//   }
// };

// /**
//  * Store the access token after successful login.
//  */
// export const setAuth = (token: string): void => {
//   try {
//     localStorage.setItem(ACCESS_TOKEN_KEY, token);
//     localStorage.setItem(AUTH_STORAGE_KEY, 'true');
//   } catch {
//     // Ignore storage errors
//   }
// };

// /**
//  * Clear authentication data during logout.
//  */
// export const clearAuth = (): void => {
//   try {
//     localStorage.removeItem(ACCESS_TOKEN_KEY);
//     localStorage.removeItem(AUTH_STORAGE_KEY);
//   } catch {
//     // Ignore storage errors
//   }
// };

// /**
//  * Check whether the user is authenticated.
//  */
// export const isAuthenticated = (): boolean => {
//   try {
//     const token = localStorage.getItem(ACCESS_TOKEN_KEY);
//     return !!token;
//   } catch {
//     return false;
//   }
// };


/**
 * @file authStorage.ts
 * @description Utilities for persisting authentication state, JWT token, and user identity.
 * @version 2.1.0
 */

// Define keys for LocalStorage
const ACCESS_TOKEN_KEY = 'accessToken';
const USERNAME_KEY = 'username'; // This stores the employee code (e.g., IWT68)
const AUTH_STATE_KEY = 'isAuthenticated';

/**
 * Get the stored JWT access token.
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Get the stored username/emp_code. 
 * This is used by TopNavbar to fetch the employee profile.
 */
export const getUsername = (): string | null => {
  try {
    return localStorage.getItem(USERNAME_KEY);
  } catch {
    return null;
  }
};

/**
 * Store authentication data after successful login.
 * @param token - The JWT access token from the API
 * @param username - The username/emp_code from the API (e.g., "IWT68")
 */
export const setAuth = (token: string, username: string): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(AUTH_STATE_KEY, 'true');
  } catch (error) {
    console.error("Error saving auth data to localStorage", error);
  }
};

/**
 * Clear all authentication and user data during logout.
 */
export const clearAuth = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(AUTH_STATE_KEY);
    // Optional: Clear everything to be safe
    // localStorage.clear(); 
  } catch (error) {
    console.error("Error clearing auth data", error);
  }
};

/**
 * Check whether the user is currently authenticated.
 */
export const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const authState = localStorage.getItem(AUTH_STATE_KEY);
    return !!token && authState === 'true';
  } catch {
    return false;
  }
};