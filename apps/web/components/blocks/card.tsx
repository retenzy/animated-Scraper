import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { getFeatureIcon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

export default function Card({
  icon,
  title,
  text,
  linkLabel,
  linkHref,
  backgroundColor = 'card',
  textColor,
  anchorId,
  items,
  customCss,
  puckId,
}: {
  icon?: string
  title?: string
  text?: string
  linkLabel?: string
  linkHref?: string
  anchorId?: string
  items?: () => ReactNode
  puckId?: string
} & BlockStyleProps) {
  const Icon = getFeatureIcon(icon)
  const showIcon = Boolean(icon && icon !== 'none')
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <div
      id={domId}
      style={blockStyleVars({ backgroundColor, textColor })}
      className={cn(
        'flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 transition hover:bg-card/80',
        blockStyleClasses({ backgroundColor, textColor }),
      )}
    >
      {showIcon && <Icon className="h-8 w-8 text-primary" />}
      {title && <h3 className="text-lg font-semibold text-inherit">{title}</h3>}
      {text && <p className="text-sm opacity-70 leading-relaxed">{text}</p>}
      {items?.()}
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
    </>
  )
}
