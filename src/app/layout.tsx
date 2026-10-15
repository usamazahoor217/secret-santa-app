import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d2818',
};

export const metadata: Metadata = {
  title: 'Secret Santa Organizer | Free Online Gift Exchange & Pairing Generator',
  description:
    'Effortlessly organize your family, friend, and workplace Secret Santa events. Automated constraint-aware matching, zero spoilers, magic email links via Resend, and integrated wishlists.',
  keywords: [
    'Secret Santa generator',
    'Secret Santa organizer',
    'online Secret Santa',
    'gift exchange generator',
    'Secret Santa with exclusion rules',
    'Christmas gift exchange app',
    'free Secret Santa draw',
  ],
  authors: [{ name: 'Secret Santa Team' }],
  creator: 'Secret Santa Organizer',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Secret Santa Organizer | Effortless Holiday Gift Exchanges',
    description:
      'Organize your holiday gift exchange in 60 seconds with automated matching, zero spoilers, and magic email links.',
    siteName: 'SecretSanta.io',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Secret Santa Organizer - Stress-free holiday gift exchanges',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Santa Organizer | Free Online Gift Exchange',
    description:
      'Zero spoilers, custom exclusion rules, and instant magic email reveal links for your holiday gift exchange.',
    creator: '@secretsanta',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Secret Santa Organizer',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Modern, privacy-first Secret Santa organizer with automated derangement matching, exclusion rules, and magic email reveal links.',
  };

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full font-sans bg-snow-50 text-slate-900 flex flex-col">
        {children}
      </body>
    </html>
  );
}
