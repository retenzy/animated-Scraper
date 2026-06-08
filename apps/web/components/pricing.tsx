'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

const plans = [
  { coins: 10, price: '1.99', label: 'Starter', description: 'Best for occasional review extraction and small scale verification.', popular: false },
  { coins: 50, price: '4.99', label: 'Professional', description: 'Designed for active sellers needing continuous Amazon reviews tracking.', popular: true },
  { coins: 100, price: '8.99', label: 'Enterprise', description: 'For teams extracting high volume product catalogs or historical databases.', popular: false },
]

export default function Pricing({ onLoginClick }: { onLoginClick: () => void }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<number | null>(null)

  const handlePurchase = async (planCoins: number, planPrice: string) => {
    if (!session?.user) {
      onLoginClick()
      return
    }

    setLoading(planCoins)
    try {
      const userId = (session.user as Record<string, unknown>).id
      const res = await fetch(`/api/credits/${userId}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: planCoins, price: planPrice, clientUrl: window.location.origin }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Failed to connect to billing backend.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Fuel Your Extractors</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">Flexible packages. Fast credit delivery via Stripe Checkout.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
                {plan.coins} Scrapes (Coins)
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-grow">{plan.description}</p>
              <button
                onClick={() => handlePurchase(plan.coins, plan.price)}
                disabled={loading !== null}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                } disabled:opacity-50`}
              >
                {loading === plan.coins ? 'Loading...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
