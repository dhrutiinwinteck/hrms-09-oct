/**
 * @file routeGuard.ts
 * @description Route guard utilities (used by ProtectedRoute).
 * @version 1.0.0
 */

import { isAuthenticated } from './authStorage';

/**
 * Checks if the user is authenticated.
 * Can be used in loaders or route guards.
 */
export const requireAuth = (): boolean => {
  return isAuthenticated();
};