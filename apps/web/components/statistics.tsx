import type { LandingPage } from '@/payload-types'

type Statistics = NonNullable<LandingPage['statistics']>

const fallbackStats = [
  { value: '5,000+', label: 'Active sellers' },
  { value: '1M+', label: 'Reviews extracted' },
  { value: '99.8%', label: 'Success rate' },
]

export default function Statistics({ statistics }: { statistics?: Statistics }) {
  const heading = statistics?.heading || 'Retenzy by the numbers'
  const subheading = statistics?.subheading || 'Real results from real sellers and researchers'
  const stats = statistics?.stats?.filter(Boolean).length ? statistics.stats : fallbackStats

  return (
    <section className="py-20 px-6 bg-primary">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">{heading}</h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">{subheading}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-4xl md:text-5xl font-extrabold text-primary-foreground">{stat.value}</p>
              <p className="text-primary-foreground/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
