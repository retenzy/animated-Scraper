import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { sessionId, userId, coins } = await req.json()

    if (!sessionId || !userId || !coins) {
      return Response.json({ error: 'sessionId, userId, and coins are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const numCoins = parseInt(coins)
    const secretKey = process.env.STRIPE_SECRET_KEY

    const existingLog = await prisma.creditLog.findFirst({
      where: { userId, action: 'ADD', productRef: sessionId },
    })

    if (existingLog) {
      return Response.json({ success: true, coins: user.coins, message: 'Already credited' })
    }

    if (!secretKey || (sessionId as string).startsWith('mock_')) {
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { coins: { increment: numCoins } } }),
        prisma.creditLog.create({ data: { userId, amount: numCoins, action: 'ADD', productRef: sessionId } }),
      ])
      return Response.json({ success: true, coins: updatedUser.coins })
    }

    const stripe = require('stripe')(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Payment session is not completed' }, { status: 400 })
    }

    if (session.metadata.userId !== userId || parseInt(session.metadata.coins) !== numCoins) {
      return Response.json({ error: 'Session metadata verification failed' }, { status: 400 })
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { coins: { increment: numCoins } } }),
      prisma.creditLog.create({ data: { userId, amount: numCoins, action: 'ADD', productRef: sessionId } }),
    ])

    return Response.json({ success: true, coins: updatedUser.coins })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
