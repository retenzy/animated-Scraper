import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LandingPage } from '@/payload-types'

type Hero = NonNullable<LandingPage['hero']>

export default function Hero({
  hero,
  onLoginClick,
}: {
  hero?: Hero
  onLoginClick?: () => void
}) {
  const badge = hero?.badge || 'Trusted by 5,000+ sellers'
  const title = hero?.title || 'Extract Amazon reviews'
  const highlightedText = hero?.highlightedText || 'in seconds'
  const subtitle =
    hero?.subtitle ||
    'High-speed local scraping powered by a Chrome extension. Secure credentials, credit-based billing, and instant CSV exports.'
  const primaryCtaLabel = hero?.primaryCtaLabel || 'Get started'
  const secondaryCtaLabel = hero?.secondaryCtaLabel || 'Install extension'
  const stats = hero?.stats?.filter(Boolean).length
    ? hero.stats
    : [
        { value: '1M+', label: 'Reviews extracted' },
        { value: '50ms', label: 'Per product avg' },
        { value: '99.8%', label: 'Success rate' },
      ]

  return (
    <section className="min-h-screen pt-24 pb-20 px-6 bg-gradient-to-b from-background via-background to-card">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <span className="text-xs font-medium text-foreground/70">{badge}</span>
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight text-foreground">
          {title} {highlightedText && <span className="text-primary">{highlightedText}</span>}
        </h1>

        <p className="text-lg md:text-xl text-foreground/70 text-balance leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {onLoginClick ? (
            <>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group" onClick={onLoginClick}>
                {primaryCtaLabel}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-card" onClick={onLoginClick}>
                {secondaryCtaLabel}
              </Button>
            </>
          ) : (
            <>
              <a href="/" className={cn(buttonVariants({ size: 'lg' }), 'bg-primary text-primary-foreground hover:bg-primary/90 group')}>
                {primaryCtaLabel}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
              </a>
              <a href="/" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'border-border hover:bg-card')}>
                {secondaryCtaLabel}
              </a>
            </>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-6 pt-12 border-t border-border/50">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
