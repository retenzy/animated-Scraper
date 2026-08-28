import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

export default function CardMedia({
  media,
  title,
  text,
  linkLabel,
  linkHref,
  mediaSide = 'top',
}: {
  media?: () => ReactNode
  title?: string
  text?: string
  linkLabel?: string
  linkHref?: string
  mediaSide?: 'top' | 'left'
}) {
  const body = (
    <div className="flex flex-1 flex-col gap-3 p-6">
      {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
      {text && <p className="text-sm text-foreground/60 leading-relaxed">{text}</p>}
      {linkLabel && linkHref && (
        <a
          href={linkHref}
          className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  )

  const mediaWrap = <div className="relative min-h-32 bg-muted">{media?.()}</div>

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      {mediaSide === 'left' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {mediaWrap}
          {body}
        </div>
      ) : (
        <>
          {mediaWrap}
          {body}
        </>
      )}
    </div>
  )
}
