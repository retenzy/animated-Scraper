'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, ArrowDownToLine } from 'lucide-react'

interface CreditLog {
  id: string
  amount: number
  action: string
  productRef: string | null
  createdAt: string
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<CreditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = (session?.user as Record<string, unknown>)?.id
    if (!userId) return
    fetch(`/api/credits/${userId}/logs`)
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const purchases = logs.filter((l) => l.action === 'ADD' && l.amount > 0)
  const totalCoinsPurchased = purchases.reduce((sum, l) => sum + l.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">View your purchase history and buy more credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Purchases</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{purchases.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <ArrowDownToLine className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Coins Purchased</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCoinsPurchased}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Balance</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{(session?.user as Record<string, unknown>)?.coins as number ?? 0}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Purchase History</h2>
          <Link
            href="/dashboard/buy-credits"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Buy More Coins
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No purchases yet.</p>
              <Link href="/dashboard/buy-credits" className="text-sm text-primary hover:text-primary/80 transition mt-2 inline-block">
                Buy your first credits
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Coins</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                      <td className="py-3 px-2 text-foreground">{new Date(log.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 font-semibold text-foreground">+{log.amount}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {log.amount <= 10 ? '$1.99' : log.amount <= 50 ? '$4.99' : '$8.99'}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
