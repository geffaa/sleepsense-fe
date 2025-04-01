"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Input from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type RegistrationError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const RegisterForm: React.FC = () => {
  const { register, loading } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ 
    fullName?: string;
    email?: string; 
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // Default role
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear registration error when user types
    if (registerError) {
      setRegisterError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: { 
      fullName?: string;
      email?: string; 
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      // Redirect is handled in the AuthContext
    } catch (error) {
      // Properly type the error object
      const typedError = error as RegistrationError;
      console.error('Registration failed:', error);
      setRegisterError(
        typedError.response?.data?.message || 
        typedError.message || 
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
        <p className="mt-2 text-gray-600">Please enter your details to get started</p>
      </div>
      
      {registerError && (
        <Alert className="mb-6 text-red-800 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>{registerError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          name="fullName"
          id="fullName"
          placeholder="John Doe"
          autoComplete="name"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
        />
        
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
          placeholder="Create a password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <div className="p-3 border rounded-md">
          <p className="mb-2 text-sm font-medium text-gray-700">I want to register as a:</p>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id="role-patient"
                name="role"
                type="radio"
                value="patient"
                checked={formData.role === 'patient'}
                onChange={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="role-patient" className="ml-2 text-sm text-gray-700">
                Patient
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="role-doctor"
                name="role"
                type="radio"
                value="doctor"
                checked={formData.role === 'doctor'}
                onChange={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="role-doctor" className="ml-2 text-sm text-gray-700">
                Doctor
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          className="mt-6"
        >
          Create account
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;