import React from 'react';
import Link from 'next/link';
import Logo from '@/components/icons/logo';
import LoginIllustration from '@/components/icons/login-illustration';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No header needed for auth pages
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Auth form */}
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center">
              <Logo width={40} height={40} className="w-auto h-10" />
              <span className="ml-2 text-xl font-bold text-blue-600">SleepSense</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 object-cover w-full h-full bg-gradient-to-r from-blue-400 to-blue-600">
          <div className="flex flex-col items-center justify-center h-full px-12 text-white">
            <LoginIllustration 
              width={500} 
              height={400}
              className="w-full max-w-lg mb-8"
            />
            <h2 className="mb-4 text-3xl font-bold text-center">
              Sleep Better. Live Better.
            </h2>
            <p className="max-w-xl text-lg text-center">
              SleepSense provides AI-powered sleep monitoring for early detection of Obstructive Sleep Apnea and better health management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}