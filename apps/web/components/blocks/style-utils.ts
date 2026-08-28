import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

export const fontSizeMap = {
  inherit: '',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl md:text-4xl',
  '4xl': 'text-4xl md:text-5xl',
} as const

export const fontWeightMap = {
  inherit: '',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const

export const bgColorMap = {
  none: '',
  white: 'bg-white',
  black: 'bg-black',
  muted: 'bg-muted',
  card: 'bg-card',
  secondary: 'bg-secondary',
  primary: 'bg-primary',
  accent: 'bg-accent',
} as const

export const fgColorMap = {
  inherit: '',
  foreground: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  accent: 'text-accent',
  white: 'text-white',
  black: 'text-black',
} as const

const p = { none: '', sm: 'p-3', md: 'p-6', lg: 'p-10' } as const
const px = { none: '', sm: 'px-3', md: 'px-6', lg: 'px-10' } as const
const py = { none: '', sm: 'py-2', md: 'py-4', lg: 'py-8' } as const
const m = { none: '', sm: 'm-2', md: 'm-4', lg: 'm-8' } as const
const mx = { none: '', sm: 'mx-2', md: 'mx-4', lg: 'mx-8' } as const
const my = { none: '', sm: 'my-2', md: 'my-4', lg: 'my-8' } as const

export type SpacingMode = 'all' | 'vertical' | 'horizontal'

export type BlockStyleProps = {
  fontSize?: string
  fontWeight?: string
  backgroundColor?: string
  textColor?: string
  padding?: string
  paddingMode?: SpacingMode
  margin?: string
  marginMode?: SpacingMode
  customCss?: string
}

const spaceMaps = {
  all: { none: p.none, sm: p.sm, md: p.md, lg: p.lg },
  vertical: { none: py.none, sm: py.sm, md: py.md, lg: py.lg },
  horizontal: { none: px.none, sm: px.sm, md: px.md, lg: px.lg },
} as const

const marginMaps = {
  all: { none: m.none, sm: m.sm, md: m.md, lg: m.lg },
  vertical: { none: my.none, sm: my.sm, md: my.md, lg: my.lg },
  horizontal: { none: mx.none, sm: mx.sm, md: mx.md, lg: mx.lg },
} as const

export function blockStyleClasses({
  fontSize,
  fontWeight,
  backgroundColor,
  textColor,
  padding,
  paddingMode = 'all',
  margin,
  marginMode = 'all',
}: BlockStyleProps) {
  const size = (fontSizeMap as Record<string, string>)[fontSize ?? ''] ?? ''
  const weight = (fontWeightMap as Record<string, string>)[fontWeight ?? ''] ?? ''
  const bg = (bgColorMap as Record<string, string>)[backgroundColor ?? ''] ?? ''
  const fg = (fgColorMap as Record<string, string>)[textColor ?? ''] ?? ''
  const pad = (spaceMaps[paddingMode] as Record<string, string>)[padding ?? ''] ?? ''
  const mar = (marginMaps[marginMode] as Record<string, string>)[margin ?? ''] ?? ''
  return cn(size, weight, bg, fg, pad, mar)
}

const isRawColor = (value?: string) => Boolean(value && /^[#(]|^(rgb|hsl)a?\(/.test(value))

export function blockStyleVars({
  backgroundColor,
  textColor,
}: Pick<BlockStyleProps, 'backgroundColor' | 'textColor'>): CSSProperties {
  const style: CSSProperties = {}
  if (isRawColor(backgroundColor)) style.backgroundColor = backgroundColor
  if (isRawColor(textColor)) style.color = textColor
  return style
}
