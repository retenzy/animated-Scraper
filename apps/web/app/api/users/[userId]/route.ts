import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({ id: user.id, username: user.username, coins: user.coins })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
