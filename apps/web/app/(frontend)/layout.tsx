import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Providers from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://retenzyreviews.com'),
  title: {
    default: 'Retenzy - Extract Amazon Reviews in Seconds',
    template: '%s | Retenzy',
  },
  description: 'High-speed local scraping of Amazon reviews powered by Chrome extension. Manage credits, export CSV data, and sync with your dashboard.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://retenzyreviews.com',
    siteName: 'Retenzy',
    title: 'Retenzy - Extract Amazon Reviews in Seconds',
    description: 'Extract Amazon product reviews locally and export them as CSV with powerful filters.',
    images: ['/icon.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Retenzy - Extract Amazon Reviews in Seconds',
    description: 'Extract Amazon product reviews locally and export them as CSV with powerful filters.',
  },
  verification: {
    google: 'xuJMVWJch64axn2d97JY9IL1vYtfWcVXd61x8-NBAWQ',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
