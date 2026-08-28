import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { resolveBlockStyle } from './custom-style'

const maxWidths = {
  full: 'max-w-none',
  wide: 'max-w-6xl',
  container: 'max-w-7xl',
  narrow: 'max-w-3xl',
} as const

const paddings = {
  none: '',
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
} as const

export default function Container({
  children,
  maxWidth = 'container',
  padding = 'md',
  anchorId,
  customCss,
  puckId,
}: {
  children?: () => ReactNode
  maxWidth?: keyof typeof maxWidths
  padding?: keyof typeof paddings
  anchorId?: string
  puckId?: string
  customCss?: string
}) {
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <div id={domId} className={cn('mx-auto w-full px-6', maxWidths[maxWidth], paddings[padding])}>
      {children?.()}
    </div>
    </>
  )
}
