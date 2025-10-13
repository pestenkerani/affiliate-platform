import './globals.css';
import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import SEO from '@/components/SEO';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <SEO />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
} 