import { prisma } from '@/lib/prisma'
import { capturePayPalOrder, priceToCoins } from '@/lib/paypal'

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json()

    if (!sessionId || !userId) {
      return Response.json({ error: 'sessionId and userId are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    // Idempotency: never credit the same order twice
    const existingLog = await prisma.creditLog.findFirst({
      where: { userId, action: 'ADD', productRef: sessionId },
    })

    if (existingLog) {
      return Response.json({ success: true, coins: user.coins, message: 'Already credited' })
    }

    const { ok, status, body } = await capturePayPalOrder(sessionId)

    if (!ok || status !== 'COMPLETED') {
      return Response.json({ error: 'Payment was not completed' }, { status: 400 })
    }

    // Verify the order belongs to this user
    const customId = body?.purchase_units?.[0]?.custom_id
    if (customId !== userId) {
      return Response.json({ error: 'Order does not match this account' }, { status: 400 })
    }

    // Derive coins from the actually captured amount (server-side catalog, not client input)
    const amount = body?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
    const numCoins = priceToCoins(amount)

    if (!numCoins) {
      return Response.json({ error: 'Unrecognized payment amount' }, { status: 400 })
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { coins: { increment: numCoins } } }),
      prisma.creditLog.create({ data: { userId, amount: numCoins, action: 'ADD', productRef: sessionId } }),
    ])

    return Response.json({ success: true, coins: updatedUser.coins })
  } catch (err) {
    const message = (err as Error).message || 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
