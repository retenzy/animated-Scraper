import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

const sizes = { default: 'default', sm: 'sm', lg: 'lg' } as const
const variants = { primary: 'default', outline: 'outline', ghost: 'ghost', link: 'link' } as const

export const borderRadiusMap = {
  default: '',
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const

export default function BlockButton({
  label,
  href,
  variant = 'primary',
  size = 'default',
  align = 'left',
  borderRadius = 'default',
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
  label?: string
  href?: string
  variant?: 'primary' | 'outline' | 'ghost' | 'link'
  size?: keyof typeof sizes
  align?: 'left' | 'center' | 'right'
  borderRadius?: keyof typeof borderRadiusMap
  anchorId?: string
  puckId?: string
} & BlockStyleProps) {
  if (!label || !href) return null
  const external = /^https?:\/\//i.test(href)
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <div
      id={domId}
      className={cn(
        'flex',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        blockStyleClasses({ margin, marginMode }),
      )}
    >
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={blockStyleVars({ backgroundColor, textColor })}
        className={cn(
          buttonVariants({ variant: variants[variant], size: sizes[size] }),
          'group inline-flex items-center justify-center',
          borderRadiusMap[borderRadius],
          blockStyleClasses({ fontSize, fontWeight, backgroundColor, textColor, padding, paddingMode }),
        )}
      >
        {label}
        <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
    </>
  )
}
