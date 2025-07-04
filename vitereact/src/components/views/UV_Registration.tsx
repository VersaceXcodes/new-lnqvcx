import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface RegistrationForm {
  email: string;
  password: string;
  username: string;
}

interface RegisterUserPayload {
  email: string;
  password: string;
  username: string;
}

interface RegisterUserResponse {
  success: boolean;
  message: string;
}

const registerUser = async (newUser: RegisterUserPayload): Promise<RegisterUserResponse> => {
  const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/register`, newUser);
  return data;
};

const UV_Registration: React.FC = () => {
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({ email: '', password: '', username: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation(registerUser, {
    onSuccess: (data) => {
      if (data.success) {
        console.log('Registration successful:', data.message);
        // Redirect or show success message
      } else {
        setErrorMessage(data.message);
      }
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setErrorMessage('You must accept the terms and privacy policy to register.');
      return;
    }
    
    setErrorMessage(null);

    const { email, password, username } = registrationForm;
    mutation.mutate({ email, password, username });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Create an Account</h1>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={registrationForm.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={registrationForm.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Username:</label>
            <input
              type="text"
              name="username"
              value={registrationForm.username}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="mr-2"
            />
            <label className="text-gray-700 text-sm">
              I agree to the <Link to="/terms" className="text-blue-500 underline">terms and privacy policy</Link>.
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
};

export default UV_Registration;