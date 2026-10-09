/**
 * @file LoginForm.tsx
 * @description Login form component with fields, validation, and submission.
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useLogin } from "../../hooks/useLogin";
import LoginInput from "../LoginInput/LoginInput";
import RememberMe from "../RememberMe/RememberMe";
import LoginButton from "../LoginButton/LoginButton";
import { LoginCredentials } from "../../types/login.types";
import "./LoginForm.css";

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useLogin();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    emp_code: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h2 className="login-form__title">Sign in</h2>
        <p className="login-form__subtitle">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="login-form__form">
        <LoginInput
          type="text"
          name="emp_code"
          placeholder="Employee Code"
          value={credentials.emp_code}
          onChange={handleChange}
          icon="user"
          required
        />
        <LoginInput
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          icon="lock"
          required
        />

        <div className="login-form__actions">
          <RememberMe checked={rememberMe} onChange={setRememberMe} />
          <a href="#" className="login-form__forgot">
            Forgot Password?
          </a>
        </div>

        {error && <div className="login-form__error">{error}</div>}

        <LoginButton type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </LoginButton>

        <p className="login-form__footer-text">
          Need access? <a href="#">Contact HR Administrator</a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
