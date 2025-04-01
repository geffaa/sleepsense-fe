"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/icons/logo';
import { usePathname } from 'next/navigation';
import { 
  Bell, Menu, X, Home, HelpCircle, 
  User, FileText, ClipboardList, Users, Settings,
  BarChart2, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: 'patient' | 'doctor';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  userRole = 'patient' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Define navigation items based on user role
  const patientNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'History', href: '/dashboard/history', icon: FileText },
    { name: 'Device', href: '/dashboard/device', icon: Settings },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const doctorNavigation = [
    { name: 'Dashboard', href: '/doctor', icon: Home },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Approvals', href: '/doctor/approvals', icon: ClipboardList },
    { name: 'Analytics', href: '/doctor/analytics', icon: BarChart2 },
    { name: 'Profile', href: '/doctor/profile', icon: User },
  ];

  const navigation = userRole === 'doctor' ? doctorNavigation : patientNavigation;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}
        aria-hidden="true"
      >
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-gray-600 ${sidebarOpen ? 'opacity-75 ease-out duration-300' : 'opacity-0 ease-in duration-200'}`} 
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div 
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform ${
            sidebarOpen ? 'translate-x-0 ease-out duration-300' : '-translate-x-full ease-in duration-200'
          }`}
        >
          <div className="absolute top-0 right-0 pt-2 -mr-12">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="w-6 h-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href={userRole === 'doctor' ? '/doctor' : '/dashboard'}>
                <div className="flex items-center">
                  <Logo width={32} height={32} className="w-auto h-8" />
                  <span className="ml-2 text-xl font-bold text-blue-600">SleepSense</span>
                </div>
              </Link>
            </div>
            <nav className="px-2 mt-5 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 ${
                      pathname === item.href ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              
              {/* Logout Button for Mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-2 py-2 text-base font-medium text-gray-600 rounded-md group hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-6 h-6 mr-4 text-gray-400 group-hover:text-red-500" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex-shrink-0 block w-full group">
              <div className="flex items-center">
                <div>
                  <div className="inline-block w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
                    <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.fullName || (userRole === 'doctor' ? 'Dr. Sarah Johnson' : 'John Doe')}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href={userRole === 'doctor' ? '/doctor' : '/dashboard'}>
                <div className="flex items-center">
                  <Logo width={32} height={32} className="w-auto h-8" />
                  <span className="ml-2 text-xl font-bold text-blue-600">SleepSense</span>
                </div>
              </Link>
            </div>
            <nav className="flex-1 px-2 mt-5 space-y-1 bg-white">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="inline-block overflow-hidden bg-gray-100 rounded-full h-9 w-9">
                  <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || (userRole === 'doctor' ? 'Dr. Sarah Johnson' : 'John Doe')}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[140px]" title={user?.email}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link
                href={userRole === 'doctor' ? '/doctor/profile' : '/dashboard/profile'}
                className="w-full px-4 py-2 text-xs font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                View Profile
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-3 h-3 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <div className="sticky top-0 z-10 pt-1 pl-1 bg-white md:hidden sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        
        <main className="flex-1 pb-8">
          <div className="px-4 py-6 mx-auto sm:px-6 md:px-8">
            {/* Navbar */}
            <div className="hidden mb-6 bg-white border border-gray-200 rounded-lg shadow-sm md:block">
              <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Welcome, {user?.fullName?.split(' ')[0] || (userRole === 'doctor' ? 'Dr. Sarah' : 'John')}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {userRole === 'doctor' 
                      ? 'Here is your patient monitoring overview' 
                      : 'Here is your sleep monitoring overview'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="sr-only">View notifications</span>
                    <Bell className="w-6 h-6" aria-hidden="true" />
                  </button>
                  <button className="p-2 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="sr-only">Get help</span>
                    <HelpCircle className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;