'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function PaymentSuccessPage() {
  const { update } = useSession()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id') || params.get('token')
    const coins = params.get('coins')
    const userId = params.get('userId')

    if (!sessionId || !coins || !userId) {
      setStatus('error')
      setMessage('Invalid payment response. No session data found.')
      return
    }

    verifyPayment(sessionId, userId, coins)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const verifyPayment = async (sessionId: string, userId: string, coins: string) => {
    try {
      const res = await fetch('/api/credits/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, coins }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(`Successfully added ${coins} coins! Your balance is now ${data.coins} coins.`)
        await update()
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify payment.')
      }
    } catch {
      setStatus('error')
      setMessage('Could not connect to the server.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8 text-center space-y-6">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
            <h1 className="text-2xl font-bold text-foreground">{message}</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-destructive text-3xl font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard/billing')}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                View Billing
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition"
              >
                Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
