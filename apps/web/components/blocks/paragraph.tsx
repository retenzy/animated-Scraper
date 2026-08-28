import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

export default function Paragraph({
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
      <div
      id={domId}
      style={blockStyleVars({ backgroundColor, textColor })}
      className={cn(
        'space-y-4 text-foreground/70 leading-relaxed text-base md:text-lg text-balance',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        blockStyleClasses({ fontSize, fontWeight, backgroundColor, textColor, padding, paddingMode, margin, marginMode }),
        className,
      )}
    >
      {text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </div>
    </>
  )
}
