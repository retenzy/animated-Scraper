import Link from 'next/link'
import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

export type ListItem = {
  text?: string
  href?: string
}

export default function BlockList({
  items,
  ordered = false,
  align = 'left',
  anchorId,
  customCss,
  puckId,
  fontSize,
  fontWeight,
  backgroundColor,
  textColor,
  padding,
  paddingMode,
  margin,
  marginMode,
}: {
  items?: ListItem[]
  ordered?: boolean
  align?: 'left' | 'center' | 'right'
  anchorId?: string
  puckId?: string
  className?: string
} & BlockStyleProps) {
  const list = (items ?? []).filter((item) => item.text)
  if (list.length === 0) return null
  const Tag = ordered ? 'ol' : 'ul'
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <Tag
      id={domId}
      style={blockStyleVars({ backgroundColor, textColor })}
      className={cn(
        'space-y-2 text-foreground/80 leading-relaxed',
        ordered ? 'list-decimal' : 'list-disc',
        align === 'center' && 'text-center list-inside',
        align === 'right' && 'text-right list-inside',
        !align.startsWith('c') && align !== 'right' && 'pl-6',
        blockStyleClasses({ fontSize, fontWeight, backgroundColor, textColor, padding, paddingMode, margin, marginMode }),
      )}
    >
      {list.map((item, index) => (
        <li key={index}>
          {item.href ? (
            <a
              href={item.href}
              target={/^https?:\/\//i.test(item.href) ? '_blank' : undefined}
              rel={/^https?:\/\//i.test(item.href) ? 'noopener noreferrer' : undefined}
              className="text-primary underline-offset-4 hover:underline"
            >
              {item.text}
            </a>
          ) : (
            item.text
          )}
        </li>
      ))}
    </Tag>
    </>
  )
}
