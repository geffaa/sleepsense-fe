"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Input from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  // We're not using router directly anymore since navigation is handled in the AuthContext
  
  // Use the useSearchParams hook only when accessing search parameters
  const isRegistered = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('registered') === 'true';
  
  const { login, loading } = useAuth();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear login error when user types
    if (loginError) {
      setLoginError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await login(formData.email, formData.password);
      // The redirect will be handled in the AuthContext
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
        <p className="mt-2 text-gray-600">Enter your credentials to access your account</p>
      </div>
      
      {isRegistered && (
        <Alert className="mb-6 text-green-800 border-green-200 bg-green-50">
          <AlertCircle className="w-4 h-4 text-green-600" />
          <AlertDescription>
            Registration successful! Please log in with your new account.
          </AlertDescription>
        </Alert>
      )}
      
      {loginError && (
        <Alert className="mb-6 text-red-800 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          name="email"
          id="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember_me" className="block ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          className="mt-5"
        >
          Sign in
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-800">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;