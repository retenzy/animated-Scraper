import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cms-api/', '/admin/', '/dashboard/', '/payment-success/'],
    },
    sitemap: 'https://retenzyreviews.com/sitemap.xml',
  }
}
