import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

const maxWidths = {
  full: 'max-w-none',
  wide: 'max-w-6xl',
  container: 'max-w-7xl',
  narrow: 'max-w-3xl',
} as const

export default function Section({
  children,
  background = 'none',
  padding = 'lg',
  maxWidth = 'container',
  id,
  textColor,
  customCss,
  puckId,
}: {
  children?: () => ReactNode
  background?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: keyof typeof maxWidths
  id?: string
  puckId?: string
} & BlockStyleProps) {
  const { domId, styleEl } = resolveBlockStyle(customCss, id, puckId)
  return (
    <>
      {styleEl}
      <section
      id={domId}
      style={blockStyleVars({ backgroundColor: background, textColor })}
      className={cn(
        'w-full',
        background === 'muted' && 'bg-muted',
        background === 'card' && 'bg-card',
        background === 'primary' && 'bg-primary',
        padding === 'sm' && 'py-12',
        padding === 'md' && 'py-16',
        padding === 'lg' && 'py-20',
        blockStyleClasses({ textColor }),
      )}
    >
      <div className={cn('mx-auto w-full px-6', maxWidths[maxWidth])}>{children?.()}</div>
    </section>
    </>
  )
}
