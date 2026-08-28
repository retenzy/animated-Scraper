'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ScrapeHistory from '@/components/dashboard/scrape-history'

interface ScrapeJob {
  id: string
  productRef: string
  url: string
  status: string
  reviewCount: number
  createdAt: string
}

export default function ScrapeHistoryPage() {
  const { data: session } = useSession()
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

  const successCount = scrapes.filter((s) => s.status === 'SUCCESS').length
  const totalReviews = scrapes.reduce((sum, s) => sum + s.reviewCount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scrape History</h1>
        <p className="text-muted-foreground mt-1">All your past extraction jobs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-foreground">{scrapes.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Successful</p>
          <p className="text-2xl font-bold text-emerald-500">{successCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-foreground">{totalReviews}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ScrapeHistory scrapes={scrapes} loading={loading} />
      </div>
    </div>
  )
}
