import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/src/hooks/useAuth';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: '%s | Bill Splitter',
    default: 'Bill Splitter - Split bills and expenses with friends',
  },
  description: 'Split bills and expenses with friends easily and fairly',
  keywords: ['bill splitter', 'expense tracker', 'split bills', 'group expenses'],
  authors: [{ name: 'Bill Splitter Team' }],
};

export function generateViewport() {
  return 'width=device-width, initial-scale=1';
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">{children}</div>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
