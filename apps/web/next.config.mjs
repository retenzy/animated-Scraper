import path from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['@prisma/client'],
  turbopack: {
    // Monorepo root, resolved from this file so it works on any machine and on Vercel.
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig)