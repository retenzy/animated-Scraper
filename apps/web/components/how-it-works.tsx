import { Check } from 'lucide-react'

const steps = [
  { number: '01', title: 'Login & connect', description: 'Sign up with email or Google. Install the Chrome extension and connect it to your account.' },
  { number: '02', title: 'Purchase credits', description: 'Buy coins via Stripe. Credits roll over each month—use them whenever you need.' },
  { number: '03', title: 'Start extracting', description: 'Open Amazon product pages or paste ASINs in the extension popup. Watch reviews load in real-time.' },
  { number: '04', title: 'Export & analyze', description: 'Download reviews as CSV instantly. Keep all data local for competitive research and insights.' },
]

const benefits = [
  'Save hours on manual review collection',
  'Keep data completely local and fast',
  'One-click sync across all devices',
  'Track usage and credits from dashboard',
  'Process live Amazon domains instantly',
  'Scale from 1 to 1000+ extractions',
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">Simple workflow</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">Get started in minutes. No setup headaches or complex configurations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative p-8 rounded-lg bg-background border border-border">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-foreground rounded-full flex items-center justify-center text-background text-sm font-bold">{step.number}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-2">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 p-8 rounded-lg bg-background border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-6">Why teams love Retenzy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                <span className="text-foreground/80">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
