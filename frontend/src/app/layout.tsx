import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GENIUS – Memory Game',
  description: 'The classic Genius / Simon Says game with real-time multiplayer.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgb(var(--surface-2))',
                color: 'rgb(var(--text-primary))',
                border: '1px solid rgb(var(--border)/0.1)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'var(--font-body, system-ui)',
                boxShadow: '0 8px 24px rgb(0 0 0 / 0.2)',
                padding: '10px 14px',
              },
              success: { iconTheme: { primary: 'rgb(var(--success))', secondary: 'white' } },
              error:   { iconTheme: { primary: 'rgb(var(--danger))', secondary: 'white' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
