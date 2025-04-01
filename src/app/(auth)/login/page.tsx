import React from 'react';
import LoginForm from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | SleepSense',
  description: 'Login to your SleepSense account',
};

export default function LoginPage() {
  return <LoginForm />;
}