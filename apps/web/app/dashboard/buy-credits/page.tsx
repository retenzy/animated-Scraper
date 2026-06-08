'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  { coins: 10, price: '1.99', label: 'Starter', description: 'Perfect for trying out the extractor with a few products.', popular: false },
  { coins: 50, price: '4.99', label: 'Professional', description: 'For active sellers needing regular review extraction.', popular: true },
  { coins: 100, price: '8.99', label: 'Enterprise', description: 'Best value for high-volume research and catalogs.', popular: false },
]

export default function BuyCreditsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handlePurchase = async (planCoins: number, planPrice: string) => {
    const userId = (session?.user as Record<string, unknown>)?.id
    if (!userId) return

    setLoading(planCoins)
    setError('')
    try {
      const res = await fetch(`/api/credits/${userId}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: planCoins, price: planPrice, clientUrl: window.location.origin }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch {
      setError('Failed to connect to billing server.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Buy Credits</h1>
        <p className="text-muted-foreground mt-1">Choose a plan to add coins to your account. 1 coin = 1 product scrape.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-5 py-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {plans.map((plan) => (
          <div
            key={plan.coins}
            className={`relative p-8 rounded-xl border text-center flex flex-col items-center ${
              plan.popular
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-card'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                Best Value
              </span>
            )}
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{plan.label}</h4>
            <p className="text-4xl font-extrabold text-foreground">${plan.price}</p>
            <div className="mt-3 mb-4 px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-primary">
              {plan.coins} Coins
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-grow">{plan.description}</p>
            <button
              onClick={() => handlePurchase(plan.coins, plan.price)}
              disabled={loading !== null}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${
                plan.popular
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
              }`}
            >
              {loading === plan.coins ? 'Redirecting...' : `Buy $${plan.price}`}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 max-w-4xl">
        <h3 className="text-sm font-semibold text-foreground mb-2">How it works</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>1. Select a plan and click Buy.</li>
          <li>2. You&apos;ll be redirected to Stripe Checkout for secure payment.</li>
          <li>3. After payment, coins are added to your account instantly.</li>
          <li>4. Use 1 coin per product scrape from the Chrome extension.</li>
        </ul>
      </div>
    </div>
  )
}
