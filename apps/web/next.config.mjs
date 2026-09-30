import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['@prisma/client'],
  turbopack: {
    root: '/home/shantanu/Downloads/scraper',
  },
}

export default withPayload(nextConfig)
