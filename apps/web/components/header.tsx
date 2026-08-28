'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import type { LandingPage } from '@/payload-types'

type Navbar = NonNullable<LandingPage['navbar']>

export default function Header({
  navbar,
  onLoginClick,
}: {
  navbar?: Navbar
  onLoginClick?: () => void
}) {
  const { data: session } = useSession()
  const router = useRouter()

  if (session?.user) return null

  const handleLogin = onLoginClick ?? (() => router.push('/'))

  const navLinks = navbar?.navLinks?.filter(Boolean) ?? [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ]
  const loginLabel = navbar?.loginLabel || 'Log in'
  const ctaLabel = navbar?.ctaLabel || 'Get started'
  const logoUrl = navbar?.logoUrl
  const logoText = navbar?.logoText

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoText || 'Retenzy Logo'}
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          ) : (
            <span className="text-lg font-bold text-foreground">{logoText || 'Retenzy'}</span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/70 hover:text-foreground transition"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-foreground" onClick={handleLogin}>
            {loginLabel}
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleLogin}>
            {ctaLabel}
          </Button>
        </div>
      </nav>
    </header>
  )
}
