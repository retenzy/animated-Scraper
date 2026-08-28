import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LandingPage } from '@/payload-types'

type Cta = NonNullable<LandingPage['cta']>

export default function Cta({ cta, onLoginClick }: { cta?: Cta; onLoginClick?: () => void }) {
  const heading = cta?.heading || 'Ready to extract reviews in seconds?'
  const subtitle =
    cta?.subtitle ||
    'Join 5,000+ sellers and researchers who trust Retenzy for fast, private Amazon review data.'
  const buttonLabel = cta?.buttonLabel || 'Get started'

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto text-center space-y-6 rounded-2xl border border-border bg-card p-12 md:p-16">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">{heading}</h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">{subtitle}</p>
        <div className="pt-4">
          {onLoginClick ? (
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 group"
              onClick={onLoginClick}
            >
              {buttonLabel}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
            </Button>
          ) : (
            <a
              href="/"
              className={cn(buttonVariants({ size: 'lg' }), 'bg-primary text-primary-foreground hover:bg-primary/90 group')}
            >
              {buttonLabel}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
