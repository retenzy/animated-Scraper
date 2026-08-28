import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    const jobs = await prisma.scrapeJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, productRef: true, url: true, status: true, reviewCount: true, createdAt: true },
    })

    return Response.json(jobs)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
