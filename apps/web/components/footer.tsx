export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-lg font-bold text-foreground">Retenzy</p>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Extract Amazon reviews fast. Local scraping, credit-based control, and secure sync.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How it works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Pricing</a>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground border-t border-border/50 pt-6">
          &copy; {new Date().getFullYear()} Retenzy. Built with Next.js, shadcn/ui, and Chrome extension APIs.
        </div>
      </div>
    </footer>
  )
}
