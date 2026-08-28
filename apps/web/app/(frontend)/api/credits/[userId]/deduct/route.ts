import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const { productRef, amount } = await req.json()
    const deductAmount = Math.max(1, parseInt(amount) || 1)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    if (user.coins < deductAmount) {
      return Response.json({ error: 'Insufficient coins', coins: user.coins }, { status: 403 })
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: deductAmount } },
      }),
      prisma.creditLog.create({
        data: { userId, amount: -deductAmount, action: 'DEDUCT', productRef: productRef || null },
      }),
    ])

    return Response.json({ success: true, coins: updatedUser.coins, deducted: deductAmount })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
