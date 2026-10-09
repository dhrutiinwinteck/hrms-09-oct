import React, {
  useState,
  useCallback,
} from 'react';

import {
  useForm,
  Controller,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  Mail,
  Badge,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import {
  ChangePasswordProps,
  ChangePasswordFormData,
} from '../../types/settings.types';

import {
  changePasswordSchema,
} from '../../validations/changePassword.schema';

import {
  UI_TEXT,
} from '../../constants/settings.constants';

import {
  useChangePassword,
} from '../../hooks/useChangePassword';

import {
  PasswordStrength,
} from '../PasswordStrength/PasswordStrength';

import './ChangePassword.css';

export const ChangePassword: React.FC<
  ChangePasswordProps
> = ({
  onSuccess,
  onError,
  initialEmail = '',
}) => {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    identifierType,
    setIdentifierType,
  ] = useState<'email' | 'employeeCode'>('email');

  const {
    onSubmit: handleSubmitAsync,
    isLoading,
    isSuccess,
    error,
    reset: resetApiState,
  } = useChangePassword(
    onSuccess,
    onError,
  );

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isValid,
      isDirty,
    },
    watch,
    reset,
    setValue,
  } = useForm<ChangePasswordFormData>({
    resolver:
      zodResolver(changePasswordSchema),

    defaultValues: {
      identifierType: 'email',
      identifier: initialEmail,
      password: '',
      confirmPassword: '',
    },

    mode: 'onChange',
  });

  const watchedPassword =
    watch('password');

  const togglePasswordVisibility =
    useCallback(
      () => {
        setShowPassword(
          (prev) => !prev,
        );
      },
      [],
    );

  const toggleConfirmPasswordVisibility =
    useCallback(
      () => {
        setShowConfirmPassword(
          (prev) => !prev,
        );
      },
      [],
    );

  const handleIdentifierTypeChange =
    useCallback(
      (
        type: 'email' | 'employeeCode',
      ) => {
        setIdentifierType(type);

        setValue(
          'identifierType',
          type,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );

        setValue(
          'identifier',
          '',
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );

        resetApiState();
      },
      [
        setValue,
        resetApiState,
      ],
    );

  const onSubmitForm =
    useCallback(
      async (
        data: ChangePasswordFormData,
      ) => {
        const success =
          await handleSubmitAsync(data);

        if (success) {
          reset({
            identifierType:
              data.identifierType,

            identifier:
              data.identifier,

            password: '',
            confirmPassword: '',
          });

          setIdentifierType(
            data.identifierType,
          );

          setShowPassword(false);
          setShowConfirmPassword(false);

          resetApiState();
        }
      },
      [
        handleSubmitAsync,
        reset,
        resetApiState,
      ],
    );

  const isEmail =
    identifierType === 'email';

  const identifierLabel = isEmail
    ? 'Email ID'
    : 'Employee Code';

  const identifierPlaceholder = isEmail
    ? 'Enter your email ID'
    : 'Enter your employee code';

  return (
    <div
      className="change-password"
      role="main"
    >
      <form
        onSubmit={handleSubmit(
          onSubmitForm,
        )}
        className="change-password__form"
        noValidate
      >

        {/* ========== IDENTIFIER TYPE ========== */}

        <div className="change-password__identifier-selector">

          <label className="change-password__label">
            Identify using
            <span className="change-password__required">
              *
            </span>
          </label>

          <div
            className="change-password__identifier-options"
            role="group"
            aria-label="Choose identification method"
          >
            <button
              type="button"
              className={`change-password__identifier-option ${
                identifierType === 'email'
                  ? 'change-password__identifier-option--active'
                  : ''
              }`}
              onClick={() =>
                handleIdentifierTypeChange(
                  'email',
                )
              }
              disabled={isLoading}
              aria-pressed={
                identifierType === 'email'
              }
            >
              <Mail size={15} />
              <span>Email ID</span>
            </button>

            <button
              type="button"
              className={`change-password__identifier-option ${
                identifierType === 'employeeCode'
                  ? 'change-password__identifier-option--active'
                  : ''
              }`}
              onClick={() =>
                handleIdentifierTypeChange(
                  'employeeCode',
                )
              }
              disabled={isLoading}
              aria-pressed={
                identifierType === 'employeeCode'
              }
            >
              <Badge size={15} />
              <span>Employee Code</span>
            </button>
          </div>

        </div>

        {/* ========== IDENTIFIER FIELD ========== */}

        <div className="change-password__field">

          <label
            htmlFor="identifier"
            className="change-password__label"
          >
            {identifierLabel}{' '}
            <span className="change-password__required">
              *
            </span>
          </label>

          <div className="change-password__input-wrapper">

            {isEmail ? (
              <Mail
                className="change-password__input-icon"
                size={20}
              />
            ) : (
              <Badge
                className="change-password__input-icon"
                size={20}
              />
            )}

            <Controller
              name="identifier"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="identifier"
                  type={
                    isEmail
                      ? 'email'
                      : 'text'
                  }
                  autoComplete={
                    isEmail
                      ? 'email'
                      : 'off'
                  }
                  placeholder={
                    identifierPlaceholder
                  }
                  className={`change-password__input ${
                    errors.identifier
                      ? 'change-password__input--error'
                      : ''
                  }`}
                  aria-invalid={
                    !!errors.identifier
                  }
                  disabled={isLoading}
                />
              )}
            />

          </div>

          {errors.identifier && (
            <p
              className="change-password__error"
              role="alert"
            >
              {errors.identifier.message}
            </p>
          )}

        </div>

        {/* ========== PASSWORD FIELD ========== */}

        <div className="change-password__field">

          <label
            htmlFor="password"
            className="change-password__label"
          >
            Change Password{' '}
            <span className="change-password__required">
              *
            </span>
          </label>

          <div className="change-password__input-wrapper">

            <Lock
              className="change-password__input-icon"
              size={20}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className={`change-password__input ${
                    errors.password
                      ? 'change-password__input--error'
                      : ''
                  }`}
                  aria-invalid={
                    !!errors.password
                  }
                  disabled={isLoading}
                />
              )}
            />

            <button
              type="button"
              onClick={
                togglePasswordVisibility
              }
              className="change-password__toggle-visibility"
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          <p className="change-password__field-description">
            {
              UI_TEXT.RIGHT_PANEL
                .DESCRIPTION
            }
          </p>

          <PasswordStrength
            password={watchedPassword}
            showLabel
          />

          {errors.password && (
            <p
              className="change-password__error"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}

        </div>

        {/* ========== CONFIRM PASSWORD FIELD ========== */}

        <div className="change-password__field">

          <label
            htmlFor="confirmPassword"
            className="change-password__label"
          >
            Confirm Password{' '}
            <span className="change-password__required">
              *
            </span>
          </label>

          <div className="change-password__input-wrapper">

            <Lock
              className="change-password__input-icon"
              size={20}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  className={`change-password__input ${
                    errors.confirmPassword
                      ? 'change-password__input--error'
                      : ''
                  }`}
                  aria-invalid={
                    !!errors.confirmPassword
                  }
                  disabled={isLoading}
                />
              )}
            />

            <button
              type="button"
              onClick={
                toggleConfirmPasswordVisibility
              }
              className="change-password__toggle-visibility"
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          {errors.confirmPassword && (
            <p
              className="change-password__error"
              role="alert"
            >
              {
                errors.confirmPassword
                  .message
              }
            </p>
          )}

        </div>

        {/* ========== SUBMIT BUTTON ========== */}

        <div className="change-password__actions">

          <button
            type="submit"
            className="change-password__submit"
            disabled={
              isLoading ||
              !isValid ||
              !isDirty
            }
          >
            {isLoading ? (
              <>
                <Loader2
                  className="change-password__spinner"
                  size={20}
                />

                {
                  UI_TEXT.BUTTON
                    .SUBMITTING
                }
              </>
            ) : (
              <>
                {
                  UI_TEXT.BUTTON
                    .SUBMIT
                }

                <ArrowRight
                  className="change-password__submit-icon"
                  size={20}
                />
              </>
            )}
          </button>

          {isSuccess && (
            <p
              className="change-password__success"
              role="status"
            >
              {
                UI_TEXT.MESSAGES
                  .SUCCESS
              }
            </p>
          )}

          {error && (
            <p
              className="change-password__form-error"
              role="alert"
            >
              {error.message}
            </p>
          )}

        </div>

        {/* ========== FOOTER TEXT ========== */}

        <div className="change-password__footer">

          <p className="change-password__footer-line">
            {
              UI_TEXT.RIGHT_PANEL
                .FOOTER_LINE1
            }
          </p>

          <p className="change-password__footer-line change-password__footer-line--link">
            {
              UI_TEXT.RIGHT_PANEL
                .FOOTER_LINE2
            }
          </p>

        </div>

      </form>
    </div>
  );
};

export default ChangePassword;