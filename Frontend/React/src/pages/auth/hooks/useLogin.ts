

/**
 * @file useLogin.ts
 * @description Custom hook for login state and authentication.
 * @version 3.1.0
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { loginService } from "../services/login.service";
import type { LoginCredentials } from "../types/login.types";
import { setAuth } from "../utils/authStorage"; // Ensure this matches our updated authStorage

interface LoginErrorResponse {
  detail?: string;
  message?: string;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useLogin = (): UseLoginReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const employeeCode = credentials.emp_code.trim();

        if (!employeeCode) {
          setError("Employee Code is required.");
          return false;
        }

        if (!credentials.password) {
          setError("Password is required.");
          return false;
        }

        // 1. Call the backend login service
        const response = await loginService.login({
          emp_code: employeeCode,
          password: credentials.password,
        });

        // 2. Validate token
        if (!response.access_token || !response.access_token.trim()) {
          setError("Login succeeded but no access token was returned.");
          return false;
        }

        /**
         * CRITICAL CHANGE HERE:
         * We must save BOTH the token and the username (emp_code).
         * response.username comes from your Swagger response { "username": "IWT68", ... }
         * If the service doesn't return it, we fallback to the employeeCode typed in the form.
         */
        const usernameToStore = response.username || employeeCode;
        
        setAuth(response.access_token, usernameToStore);

        // 3. Navigate to dashboard
        navigate("/dashboard/home", { replace: true });

        return true;
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<LoginErrorResponse>;
          const status = axiosError.response?.status;

          if (status === 401) {
            setError("Invalid employee code or password.");
          } else if (status === 422) {
            setError("Invalid login data. Please check your details.");
          } else if (status && status >= 500) {
            setError("Server error. Please try again later.");
          } else {
            setError(
              axiosError.response?.data?.detail ||
              axiosError.response?.data?.message ||
              "Login failed. Please try again."
            );
          }
          return false;
        }

        if (err instanceof Error) {
          setError(err.message);
          return false;
        }

        setError("An unexpected error occurred.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  return { login, isLoading, error };
};