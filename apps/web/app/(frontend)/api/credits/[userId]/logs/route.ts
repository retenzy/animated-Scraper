import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    const logs = await prisma.creditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return Response.json(logs)
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
