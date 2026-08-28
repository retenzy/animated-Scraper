import { prisma } from '@/lib/prisma'
import { createPayPalOrder, CREDIT_PLANS } from '@/lib/paypal'

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const { coins, clientUrl: bodyClientUrl } = await req.json()

    const coinsNum = parseInt(coins)
    const price = CREDIT_PLANS[coinsNum]

    if (!price) {
      return Response.json({ error: 'Invalid credit plan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const clientUrl = bodyClientUrl || process.env.CLIENT_URL || 'https://retenzyreviews.com'
    const returnUrl = `${clientUrl}/payment-success?coins=${coinsNum}&userId=${userId}&provider=paypal`
    const cancelUrl = `${clientUrl}/`

    const { orderId, approveUrl } = await createPayPalOrder({
      amount: price,
      coins: coinsNum,
      userId,
      returnUrl,
      cancelUrl,
    })

    return Response.json({ url: approveUrl, orderId })
  } catch (err) {
    const message = (err as Error).message || 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
