const PAYPAL_API =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

export const CREDIT_PLANS: Record<number, string> = {
  10: '1.99',
  50: '4.99',
  100: '8.99',
}

export function priceToCoins(amount: string | number): number | null {
  const price = String(amount)
  const entry = Object.entries(CREDIT_PLANS).find(([, p]) => p === price)
  return entry ? parseInt(entry[0]) : null
}

let tokenCache: { token: string; expiresAt: number } | null = null

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_SECRET are not configured')
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status}`)
  }

  const data = await res.json()
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + ((data.expires_in || 32400) - 60) * 1000,
  }
  return data.access_token
}

export async function createPayPalOrder(params: {
  amount: string
  coins: number
  userId: string
  returnUrl: string
  cancelUrl: string
}) {
  const token = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.userId,
          description: `${params.coins} Credits - Retenzy Review Extractor`,
          custom_id: params.userId,
          amount: { currency_code: 'USD', value: params.amount },
        },
      ],
      application_context: {
        brand_name: 'Retenzy',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`PayPal create order error ${res.status}: ${body}`)
  }

  const order = await res.json()
  const approveLink = order.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

  return { orderId: order.id as string, approveUrl: approveLink || '' }
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const body = await res.json().catch(() => null)
  return { ok: res.ok, status: body?.status as string | undefined, body }
}
