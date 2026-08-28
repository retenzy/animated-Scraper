import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

export default function Subheading({
  text,
  align = 'left',
  className,
  anchorId,
  fontSize = 'inherit',
  fontWeight = 'inherit',
  padding,
  paddingMode,
  margin,
  marginMode,
  backgroundColor,
  textColor,
  customCss,
  puckId,
}: {
  text?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  anchorId?: string
  puckId?: string
} & BlockStyleProps) {
  if (!text) return null
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <p
      id={domId}
      style={blockStyleVars({ backgroundColor, textColor })}
      className={cn(
        'text-xs md:text-sm font-semibold uppercase tracking-widest text-primary',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        blockStyleClasses({ fontSize, fontWeight, backgroundColor, textColor, padding, paddingMode, margin, marginMode }),
        className,
      )}
    >
      {text}
    </p>
    </>
  )
}
