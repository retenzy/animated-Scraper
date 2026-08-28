import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export default function Columns({
  left,
  right,
  gap = 'md',
  valign = 'top',
}: {
  left?: () => ReactNode
  right?: () => ReactNode
  gap?: 'sm' | 'md' | 'lg'
  valign?: 'top' | 'center' | 'bottom'
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2',
        gap === 'sm' && 'gap-4',
        gap === 'lg' && 'gap-12',
        gap === 'md' && 'gap-8',
        valign === 'center' && 'items-center',
        valign === 'bottom' && 'items-end',
      )}
    >
      <div className="min-w-0">{left?.()}</div>
      <div className="min-w-0">{right?.()}</div>
    </div>
  )
}
