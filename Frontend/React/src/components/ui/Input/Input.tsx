import  { forwardRef, InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      required = false,
      helperText,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`}
          {...props}
        />

        {error && (
          <p id={errorId} className="input-error-text" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="input-helper-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;