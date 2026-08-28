import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { LandingPage } from '@/payload-types'

export const getPayloadClient = cache(async () => getPayload({ config }))

export async function getLandingPage(): Promise<LandingPage | null> {
  const payload = await getPayloadClient()
  try {
    const landing = await payload.findGlobal({
      slug: 'landing-page',
      depth: 1,
    })
    return landing as LandingPage
  } catch {
    return null
  }
}

export async function getPosts({ limit = 9, page = 1 }: { limit?: number; page?: number } = {}) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: {
      _status: { equals: 'published' },
    },
    sort: '-publishedDate',
    limit,
    page,
    depth: 1,
  })
  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
  }
}

export async function getPost(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          slug: { equals: slug },
        },
        {
          _status: { equals: 'published' },
        },
      ],
    },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
}

export async function getAllPostSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: {
      _status: { equals: 'published' },
    },
    limit: 1000,
    select: { slug: true },
    pagination: false,
  })
  return result.docs
}

export async function getPages({ limit = 100, page = 1 }: { limit?: number; page?: number } = {}) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      _status: { equals: 'published' },
    },
    sort: '-updatedAt',
    limit,
    page,
    depth: 1,
  })
  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
  }
}

export async function getPage(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          slug: { equals: slug },
        },
        {
          _status: { equals: 'published' },
        },
      ],
    },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
}

export async function getAllPageSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      _status: { equals: 'published' },
    },
    limit: 1000,
    select: { slug: true },
    pagination: false,
  })
  return result.docs
}
