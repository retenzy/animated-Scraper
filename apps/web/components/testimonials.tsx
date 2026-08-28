import { Quote } from 'lucide-react'
import type { LandingPage } from '@/payload-types'

type Testimonials = NonNullable<LandingPage['testimonials']>

export default function Testimonials({ testimonials }: { testimonials?: Testimonials }) {
  if (!testimonials?.items?.length) return null

  const { heading, subheading, items } = testimonials

  return (
    <section id="testimonials" className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">{heading}</h2>
          {subheading && <p className="text-lg text-foreground/70 max-w-2xl mx-auto">{subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="p-8 rounded-xl border border-border bg-card flex flex-col gap-4">
              <Quote className="w-8 h-8 text-primary" />
              <p className="text-foreground/80 leading-relaxed flex-grow">{item.quote}</p>
              <div className="border-t border-border/50 pt-4">
                <p className="font-semibold text-foreground">{item.name}</p>
                {item.role && <p className="text-sm text-muted-foreground">{item.role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
