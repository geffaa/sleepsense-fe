"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User } from 'lucide-react';
import Logo from '@/components/icons/logo';
import Link from 'next/link';

export default function ChooseRolePage() {
  const router = useRouter();

  const handleSelectRole = (role: 'patient' | 'doctor') => {
    // In a real app, this would set the user role in auth context/session
    if (role === 'patient') {
      router.push('/dashboard');
    } else {
      router.push('/doctor');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center">
          <Logo width={40} height={40} className="w-auto h-10" />
          <span className="ml-2 text-xl font-bold text-blue-600">SleepSense</span>
        </Link>
      </div>

      <Card className="w-full max-w-md mb-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Role</CardTitle>
          <CardDescription>
            Select your role to access the appropriate dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="flex items-center justify-center w-full h-auto py-6"
            onClick={() => handleSelectRole('patient')}
          >
            <div className="flex flex-col items-center">
              <User className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Continue as Patient</span>
              <span className="mt-1 text-sm text-gray-100">Monitor your sleep data and view results</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center w-full h-auto py-6 border-2 border-blue-200"
            onClick={() => handleSelectRole('doctor')}
          >
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 mb-2 text-blue-600" />
              <span className="text-lg font-medium text-blue-600">Continue as Doctor</span>
              <span className="mt-1 text-sm text-gray-500">Review patient data and approve analysis</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-center text-gray-500">
        Note: This is a demo application. In a real application, proper authentication would be implemented.
      </p>
    </div>
  );
}