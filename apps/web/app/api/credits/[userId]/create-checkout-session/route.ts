import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const { coins, price, clientUrl: bodyClientUrl } = await req.json()

    if (!coins || !price) {
      return Response.json({ error: 'coins and price are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const secretKey = process.env.STRIPE_SECRET_KEY
    const clientUrl = bodyClientUrl || process.env.CLIENT_URL || 'https://animated-scraper-web.vercel.app'

    if (!secretKey) {
      const mockSessionId = `mock_session_${Math.random().toString(36).substring(2, 9)}`
      const mockUrl = `${clientUrl}/payment-success?session_id=${mockSessionId}&coins=${coins}&userId=${userId}`
      return Response.json({ url: mockUrl })
    }

    const stripe = require('stripe')(secretKey)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${coins} Credits - Retenzy Review Extractor`, description: 'Top up your account to extract more reviews.' },
          unit_amount: Math.round(parseFloat(price) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&coins=${coins}&userId=${userId}`,
      cancel_url: `${clientUrl}/`,
      metadata: { userId, coins: String(coins) },
    })

    return Response.json({ url: session.url })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
