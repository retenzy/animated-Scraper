import { Coins, CheckCircle2, TrendingUp, Activity } from 'lucide-react'

const cards = [
  { label: 'Coins Remaining', icon: Coins, key: 'coins', suffix: 'coins' },
  { label: 'Total Scrapes', icon: Activity, key: 'totalScrapes', suffix: '' },
  { label: 'Success Rate', icon: CheckCircle2, key: 'successRate', suffix: '%' },
  { label: 'Status', icon: TrendingUp, key: 'status', suffix: '' },
]

export default function StatsCards({
  coins,
  totalScrapes,
  successRate,
}: {
  coins: number
  totalScrapes: number
  successRate: number
}) {
  const values: Record<string, string> = {
    coins: coins.toString(),
    totalScrapes: totalScrapes.toString(),
    successRate: successRate.toString(),
    status: coins > 0 ? 'Active' : 'Low Credits',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const val = values[card.key]
        const isLow = card.key === 'status' && coins <= 0
        const isActive = card.key === 'status' && coins > 0
        return (
          <div key={card.key} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-5 h-5 ${isLow ? 'text-destructive' : isActive ? 'text-emerald-400' : 'text-primary'}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
              {val}{card.suffix}
            </p>
          </div>
        )
      })}
    </div>
  )
}
