import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Secret Santa Organizer | Effortless Holiday Gift Exchanges',
  description:
    'Organize your family, friend, and workplace Secret Santa events with ease. Automated pairings, wishlist sharing, and zero spoilers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-snow-50 text-slate-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
