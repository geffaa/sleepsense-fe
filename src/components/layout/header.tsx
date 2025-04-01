"use client";

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/icons/logo';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="flex items-center">
                <Logo width={32} height={32} className="w-auto h-8" />
                <span className="ml-2 text-xl font-bold text-blue-600">SleepSense</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-transparent rounded-md hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;