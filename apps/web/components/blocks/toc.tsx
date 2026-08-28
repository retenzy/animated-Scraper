import { cn } from '@/lib/utils'

export type TocItem = {
  text?: string
  anchor?: string
}

export default function BlockToc({
  title = 'Table of contents',
  items,
  className,
}: {
  title?: string
  items?: TocItem[]
  className?: string
}) {
  const list = (items ?? []).filter((item) => item.text)
  if (list.length === 0) return null
  return (
    <nav className={cn('rounded-xl border border-border bg-card p-5', className)}>
      {title && <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">{title}</p>}
      <ul className="space-y-2">
        {list.map((item, index) => (
          <li key={index}>
            <a
              href={item.anchor ? `#${item.anchor}` : undefined}
              className="text-sm text-foreground/80 underline-offset-4 hover:text-primary hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
