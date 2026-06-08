import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return Response.json({ received: true })
  }

  try {
    const stripe = require('stripe')(secretKey)
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') || ''
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata.userId
      const coins = parseInt(session.metadata.coins)

      if (userId && coins && session.payment_status === 'paid') {
        const existingLog = await prisma.creditLog.findFirst({
          where: { userId, action: 'ADD', productRef: session.id },
        })

        if (!existingLog) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: userId },
              data: { coins: { increment: coins } },
            }),
            prisma.creditLog.create({
              data: { userId, amount: coins, action: 'ADD', productRef: session.id },
            }),
          ])
        }
      }
    }

    return Response.json({ received: true })
  } catch {
    return Response.json({ error: 'Webhook error' }, { status: 500 })
  }
}
