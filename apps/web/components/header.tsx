'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function Header({ onLoginClick }: { onLoginClick: () => void }) {
  const { data: session } = useSession()

  if (session?.user) return null

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://retenzy.b-cdn.net/wp-content/uploads/2026/07/retenzt-logo-scaled-e1785243763292.png"
            alt="Retenzy Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-foreground/70 hover:text-foreground transition">Features</a>
          <a href="#how-it-works" className="text-sm text-foreground/70 hover:text-foreground transition">How it works</a>
          <a href="#pricing" className="text-sm text-foreground/70 hover:text-foreground transition">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-foreground" onClick={onLoginClick}>Log in</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onLoginClick}>Get started</Button>
        </div>
      </nav>
    </header>
  )
}
