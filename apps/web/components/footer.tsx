import type { LandingPage } from '@/payload-types'

type Footer = NonNullable<LandingPage['footer']>

const fallbackLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Footer({ footer }: { footer?: Footer }) {
  const brandName = footer?.brandName || 'Retenzy'
  const tagline =
    footer?.tagline ||
    'Extract Amazon reviews fast. Local scraping, credit-based control, and secure sync.'
  const links = footer?.links?.filter(Boolean).length ? footer.links : fallbackLinks
  const copyright =
    footer?.copyright || 'Retenzy. Built with Next.js, shadcn/ui, and Chrome extension APIs.'

  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-lg font-bold text-foreground">{brandName}</p>
            <p className="text-sm text-muted-foreground max-w-md mt-1">{tagline}</p>
          </div>
          <div className="flex gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground border-t border-border/50 pt-6">
          &copy; {new Date().getFullYear()} {copyright}
        </div>
      </div>
    </footer>
  )
}
