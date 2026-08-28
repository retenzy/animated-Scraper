import type { MetadataRoute } from 'next'
import { getAllPageSlugs, getAllPostSlugs } from '@/lib/cms'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://retenzyreviews.com'
  const [posts, pages] = await Promise.all([getAllPostSlugs(), getAllPageSlugs()])

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...pages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
