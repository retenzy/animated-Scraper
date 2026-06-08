'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import HowItWorks from '@/components/how-it-works'
import Pricing from '@/components/pricing'
import Footer from '@/components/footer'
import LoginModal from '@/components/login-modal'
import PaymentNotification from '@/components/payment-notification'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<{ status: string; message: string } | null>(null)

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard')
    }
  }, [session, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const coins = params.get('coins')
    const userId = params.get('userId')

    if (sessionId && coins && userId) {
      verifyPayment(sessionId, userId, coins)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const verifyPayment = async (sessionId: string, userId: string, coins: string) => {
    setPaymentStatus({ status: 'verifying', message: 'Verifying checkout session...' })
    try {
      const res = await fetch('/api/credits/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, coins }),
      })
      const data = await res.json()
      if (res.ok) {
        setPaymentStatus({ status: 'success', message: `Success! Added ${coins} coins. Current Balance: ${data.coins} Coins.` })
        update()
        window.history.replaceState({}, document.title, window.location.pathname)
        router.push('/dashboard')
      } else {
        setPaymentStatus({ status: 'error', message: 'Failed to verify transaction.' })
      }
    } catch {
      setPaymentStatus({ status: 'error', message: 'Connection to payment verification server failed.' })
    }
  }

  return (
    <>
      <Header onLoginClick={() => setShowLoginModal(true)} />
      <PaymentNotification paymentStatus={paymentStatus} onClose={() => setPaymentStatus(null)} />

      <main>
        <Hero onLoginClick={() => setShowLoginModal(true)} />
        <Features />
        <HowItWorks />
        <Pricing onLoginClick={() => setShowLoginModal(true)} />
      </main>

      <Footer />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
