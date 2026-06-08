'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatsCards from '@/components/dashboard/stats-cards'
import ScrapeHistory from '@/components/dashboard/scrape-history'
import ExtensionPanel from '@/components/extension-panel'

interface ScrapeJob {
  id: string
  productRef: string
  url: string
  status: string
  reviewCount: number
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, update } = useSession()
  const [scrapes, setScrapes] = useState<ScrapeJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = (session?.user as Record<string, unknown>)?.id
    if (!userId) return
    fetch(`/api/scrapes/${userId}`)
      .then((r) => r.json())
      .then((data) => setScrapes(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const coins = (session?.user as Record<string, unknown>)?.coins as number ?? 0
  const totalScrapes = scrapes.length
  const successRate = totalScrapes > 0
    ? Math.round((scrapes.filter((s) => s.status === 'SUCCESS').length / totalScrapes) * 100)
    : 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.email?.split('@')[0]}
        </p>
      </div>

      <StatsCards coins={coins} totalScrapes={totalScrapes} successRate={successRate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Scrapes</h2>
              <Link
                href="/dashboard/history"
                className="text-sm text-primary hover:text-primary/80 transition"
              >
                View all
              </Link>
            </div>
            <ScrapeHistory scrapes={scrapes.slice(0, 5)} loading={loading} />
          </div>

          <ExtensionPanel />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 rounded-lg text-sm font-semibold text-center bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Install Extension
              </a>
              <Link
                href="/dashboard/buy-credits"
                className="block w-full py-3 px-4 rounded-lg text-sm font-semibold text-center border border-border bg-background text-foreground hover:bg-muted transition"
              >
                Buy More Coins
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Credit Usage</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-foreground">{coins} coins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold text-foreground">{totalScrapes} scrapes</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalScrapes / (coins + totalScrapes || 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {coins > 0 ? `${coins} scrapes remaining` : 'Out of coins — buy more to continue'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
