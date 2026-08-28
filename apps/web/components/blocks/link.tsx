import { cn } from '@/lib/utils'

export default function TextLink({
  label,
  href,
  align = 'left',
}: {
  label?: string
  href?: string
  align?: 'left' | 'center' | 'right'
}) {
  if (!label || !href) return null
  const external = /^https?:\/\//i.test(href)
  return (
    <div
      className={cn(
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
      )}
    >
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition"
      >
        {label}
      </a>
    </div>
  )
}
