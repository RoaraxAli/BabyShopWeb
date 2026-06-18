import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: {
    default: 'BabyShopHub Docs',
    template: '%s | BabyShopHub Docs',
  },
  description:
    'Complete documentation for BabyShopHub — the premium Flutter baby products shopping app. User guides and developer reference.',
  keywords: ['BabyShopHub', 'Flutter', 'baby products', 'documentation'],
};
