import type { Metadata } from 'next'
import LandingContent from '@/components/landing-content'
import { getLandingPage } from '@/lib/cms'

export const revalidate = 60

const DEFAULT_TITLE = 'Retenzy - Extract Amazon Reviews in Seconds'
const DEFAULT_DESCRIPTION =
  'High-speed local scraping of Amazon reviews powered by Chrome extension. Manage credits, export CSV data, and sync with your dashboard.'

export async function generateMetadata(): Promise<Metadata> {
  const landing = await getLandingPage()
  const seo = landing?.seo

  const title = seo?.title || DEFAULT_TITLE
  const description = seo?.description || DEFAULT_DESCRIPTION

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      url: 'https://retenzyreviews.com',
      siteName: 'Retenzy',
      title,
      description,
      images: seo?.ogImage ? [seo.ogImage] : ['/icon.png'],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
    },
  }
}

export default async function HomePage() {
  const landing = await getLandingPage()
  return <LandingContent landing={landing} />
}
