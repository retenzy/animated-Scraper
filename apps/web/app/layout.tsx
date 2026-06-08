import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Providers from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Retenzy - Extract Amazon Reviews in Seconds',
  description: 'High-speed local scraping of Amazon reviews powered by Chrome extension. Manage credits, export CSV data, and sync with your dashboard.',
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
