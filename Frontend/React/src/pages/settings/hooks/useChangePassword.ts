import { useCallback, useState } from 'react';

import {
  ChangePasswordFormData,
  UseChangePasswordReturn,
} from '../types/settings.types';

import {
  changePassword,
  changePasswordByEmployeeCode,
} from '../services/settings.service';

import { UI_TEXT } from '../constants/settings.constants';

export const useChangePassword = (
  onSuccess?: () => void,
  onError?: (error: Error) => void,
): UseChangePasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const onSubmit = useCallback(
    async (
      data: ChangePasswordFormData,
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        /* ======================================================
           EMAIL
           ======================================================

           identifierType = "email"

           API:
           POST /api/v1/auth/change-password

           Payload:
           {
             email,
             password
           }
           ====================================================== */

        const response =
          data.identifierType === 'email'
            ? await changePassword({
                email: data.identifier.trim(),
                password: data.password,
              })

            /* ==================================================
               EMPLOYEE CODE
               ==================================================

               identifierType = "employeeCode"

               API:
               POST /api/v1/auth/change-password1

               Payload:
               {
                 emp_code,
                 password
               }
               ================================================== */

            : await changePasswordByEmployeeCode({
                emp_code: data.identifier.trim(),
                password: data.password,
              });

        /* ======================================================
           SUCCESS
           ====================================================== */

        if (response.success) {
          setIsSuccess(true);

          onSuccess?.();

          return true;
        }

        /* ======================================================
           API FAILURE
           ====================================================== */

        const apiError = new Error(
          response.message ||
            UI_TEXT.MESSAGES.ERROR,
        );

        setError(apiError);

        onError?.(apiError);

        return false;
      } catch (error: unknown) {
        /* ======================================================
           UNEXPECTED ERROR
           ====================================================== */

        const caughtError =
          error instanceof Error
            ? error
            : new Error(UI_TEXT.MESSAGES.ERROR);

        setError(caughtError);
        setIsSuccess(false);

        onError?.(caughtError);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError],
  );

  /* ==========================================================
     RESET
     ========================================================== */

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  /* ==========================================================
     RETURN
     ========================================================== */

  return {
    onSubmit,
    isLoading,
    isSuccess,
    error,
    reset,
  };
};

export default useChangePassword;