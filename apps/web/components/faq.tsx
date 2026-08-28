import { ChevronDown } from 'lucide-react'
import type { LandingPage } from '@/payload-types'

type Faq = NonNullable<LandingPage['faq']>

export default function Faq({ faq }: { faq?: Faq }) {
  if (!faq?.items?.length) return null

  const { heading, subheading, items } = faq

  return (
    <section id="faq" className="py-20 px-6 bg-card">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">{heading}</h2>
          {subheading && <p className="text-lg text-foreground/70 max-w-2xl mx-auto">{subheading}</p>}
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="group rounded-lg border border-border bg-background p-6 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
                <ChevronDown className="w-5 h-5 text-foreground/60 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <p className="mt-4 text-sm text-foreground/70 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
