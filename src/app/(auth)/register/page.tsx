import React from 'react';
import RegisterForm from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | SleepSense',
  description: 'Create a new SleepSense account',
};

export default function RegisterPage() {
  return <RegisterForm />;
}