/**
 * @file ProtectedRoute.tsx
 * @description Route guard that redirects to login if not authenticated.
 * @version 1.0.0
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/authStorage';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};