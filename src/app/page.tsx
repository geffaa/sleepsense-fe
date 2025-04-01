import React from 'react';
import Link from 'next/link';
import LoginIllustration from '@/components/icons/login-illustration';
import Header from '@/components/layout/header';

export default function Home() {
  return (
    <>
      <Header />
      <div className="bg-gradient-to-b from-white to-blue-50">
        <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bg-blue-100 rounded-full -top-20 -right-40 w-80 h-80 opacity-30"></div>
            <div className="absolute bg-blue-200 rounded-full top-80 -left-20 w-60 h-60 opacity-20"></div>
            <div className="absolute w-40 h-40 bg-blue-300 rounded-full bottom-40 right-10 opacity-20"></div>
          </div>
          
          <div className="relative z-10 h-full px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
            <div className="md:flex md:items-center md:justify-between md:space-x-10">
              <div className="mb-10 md:w-1/2 md:mb-0">
                <div className="inline-block px-4 py-1 mb-6 text-sm font-medium text-white bg-blue-600 rounded-full">
                  New Technology for Sleep Health
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block mb-2">Sleep better with</span>
                  <span className="block text-blue-600">SleepSense AI</span>
                </h1>
                <p className="mt-5 text-base text-gray-500 sm:mt-6 sm:text-lg sm:max-w-xl md:text-xl">
                  Early detection of Obstructive Sleep Apnea using advanced AI and IoT technology.
                  Monitor your sleep patterns from the comfort of your home for better health outcomes.
                </p>
                
                <div className="flex flex-col mt-8 space-y-4 sm:mt-10 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Link
                    href="/register"
                    className="flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-lg hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-8 py-3 text-base font-medium text-blue-700 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 md:py-4 md:text-lg md:px-10"
                  >
                    Log in
                  </Link>
                </div>
                
                {/* Key benefits */}
                <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Non-invasive monitoring</h3>
                      <p className="mt-1 text-sm text-gray-500">Comfortable sensors track your sleep patterns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Real-time analysis</h3>
                      <p className="mt-1 text-sm text-gray-500">AI-powered detection of sleep apnea events</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Health reports</h3>
                      <p className="mt-1 text-sm text-gray-500">Detailed insights for you and your doctor</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Early detection</h3>
                      <p className="mt-1 text-sm text-gray-500">Identify sleep issues before they worsen</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center md:w-1/2">
                <div className="relative p-8 transform shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl rotate-1">
                  <div className="absolute inset-0 transform bg-white opacity-10 rounded-2xl -rotate-2"></div>
                  <LoginIllustration 
                    width={500} 
                    height={400} 
                    className="relative z-10 w-full max-w-lg" 
                  />
                  
                  {/* Testimonial overlay */}
                  <div className="absolute max-w-xs p-4 transform bg-white rounded-lg shadow-lg bottom-4 right-4 bg-opacity-95 -rotate-2">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic text-gray-600">SleepSense helped me identify my sleep apnea condition early and get the treatment I needed.</p>
                    <p className="mt-2 text-xs font-semibold text-gray-800">— John D., SleepSense User</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}