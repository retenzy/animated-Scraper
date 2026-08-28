import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId, productRef, url, status, reviewCount } = await req.json()

    if (!userId || !productRef || !url || !status) {
      return Response.json({ error: 'userId, productRef, url, and status are required' }, { status: 400 })
    }

    const job = await prisma.scrapeJob.create({
      data: { userId, productRef, url, status, reviewCount: reviewCount || 0 },
    })

    return Response.json({ id: job.id, status: job.status, reviewCount: job.reviewCount }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
