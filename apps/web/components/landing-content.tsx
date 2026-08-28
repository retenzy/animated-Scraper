'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import Statistics from '@/components/statistics'
import HowItWorks from '@/components/how-it-works'
import Testimonials from '@/components/testimonials'
import Faq from '@/components/faq'
import Cta from '@/components/cta'
import Pricing from '@/components/pricing'
import Footer from '@/components/footer'
import LoginModal from '@/components/login-modal'
import PaymentNotification from '@/components/payment-notification'
import { useRouter } from 'next/navigation'
import type { LandingPage } from '@/payload-types'

export default function LandingContent({ landing }: { landing: LandingPage | null }) {
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
    const sessionId = params.get('session_id') || params.get('token')
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
      <Header navbar={landing?.navbar} onLoginClick={() => setShowLoginModal(true)} />
      <PaymentNotification paymentStatus={paymentStatus} onClose={() => setPaymentStatus(null)} />

      <main>
        <Hero hero={landing?.hero} onLoginClick={() => setShowLoginModal(true)} />
        <Features features={landing?.features} />
        <Statistics statistics={landing?.statistics} />
        <HowItWorks howItWorks={landing?.howItWorks} />
        <Testimonials testimonials={landing?.testimonials} />
        <Faq faq={landing?.faq} />
        <Pricing onLoginClick={() => setShowLoginModal(true)} />
        <Cta cta={landing?.cta} onLoginClick={() => setShowLoginModal(true)} />
      </main>

      <Footer footer={landing?.footer} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
