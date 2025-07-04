import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import { useAppStore } from '@/store/main';

interface LoginForm {
  email: string;
  password: string;
}

const UV_Login: React.FC = () => {
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const setAuthToken = useAppStore((state) => state.set_auth_token);
  const history = useHistory();

  // Define the mutation function for logging in
  const loginMutation = useMutation(
    async (loginData: LoginForm) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/login`,
        loginData
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        setAuthToken(data.auth_token);
        history.push('/user-profile');
      },
      onError: (error: any) => {
        console.error('Login failed:', error.response?.data.message || error.message);
        setErrorMessage('Login failed. Please check your credentials and try again.');
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    loginMutation.mutate(loginForm);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Login</h2>
          <input
            type="email"
            name="email"
            value={loginForm.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            name="password"
            value={loginForm.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <div className="flex justify-between items-center">
            <div>
              <input type="checkbox" id="remember-me" className="mr-2" />
              <label htmlFor="remember-me">Remember Me</label>
            </div>
            <Link to="/forgot-password" className="text-sm text-blue-500">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? 'Logging in...' : 'Login'}
          </button>
          {errorMessage && (
            <p className="text-red-500 text-center">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </>
  );
};

export default UV_Login;