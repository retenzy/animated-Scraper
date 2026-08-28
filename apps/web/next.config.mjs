import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['@prisma/client'],
  turbopack: {
    root: '/home/dev-4/Developer/animated-Scraper',
  },
}

export default withPayload(nextConfig)
