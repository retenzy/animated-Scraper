import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

const tags = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export default function Heading({
  text,
  level = 2,
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
  level?: keyof typeof tags
  align?: 'left' | 'center' | 'right'
  className?: string
  anchorId?: string
  puckId?: string
} & BlockStyleProps) {
  if (!text) return null
  const Tag = tags[level]
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <Tag
        id={domId}
        style={blockStyleVars({ backgroundColor, textColor })}
      className={cn(
        'font-bold text-foreground text-balance leading-tight',
        fontSize === 'inherit' && (level === 2 ? 'text-3xl md:text-4xl' : level === 3 ? 'text-2xl' : 'text-xl'),
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        blockStyleClasses({ fontSize, fontWeight, backgroundColor, textColor, padding, paddingMode, margin, marginMode }),
        className,
      )}
    >
      {text}
    </Tag>
    </>
  )
}
