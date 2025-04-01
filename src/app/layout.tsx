import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | SleepSense',
    default: 'SleepSense - Smart Sleep Apnea Detection',
  },
  description: 'SleepSense provides AI-powered sleep monitoring for early detection of Obstructive Sleep Apnea and better health management.',
  keywords: ['sleep apnea', 'OSA', 'health', 'monitoring', 'AI', 'IoT'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Header moved to individual page layouts */}
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}