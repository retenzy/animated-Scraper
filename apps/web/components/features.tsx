import { getFeatureIcon } from '@/lib/icons'
import type { LandingPage } from '@/payload-types'

type Features = NonNullable<LandingPage['features']>

const fallbackItems = [
  { icon: 'zap', title: 'Lightning fast', description: 'Extract thousands of reviews in minutes with optimized local processing' },
  { icon: 'lock', title: 'Local & secure', description: 'All data stays on your computer. No cloud uploads, complete privacy' },
  { icon: 'download', title: 'Export as CSV', description: 'Download research-ready datasets instantly for analysis and reporting' },
]

export default function Features({ features }: { features?: Features }) {
  const heading = features?.heading || 'Everything you need'
  const subheading =
    features?.subheading ||
    'Build your Amazon research workflow with powerful features designed for sellers and researchers'
  const items = features?.items?.filter(Boolean).length ? features.items : fallbackItems

  return (
    <section id="features" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">{heading}</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">{subheading}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((feature, index) => {
            const Icon = getFeatureIcon(feature?.icon)
            return (
              <div key={index} className="p-6 rounded-lg border border-border bg-card hover:bg-card/80 transition group">
                <Icon className="w-10 h-10 text-primary group-hover:text-accent transition mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
