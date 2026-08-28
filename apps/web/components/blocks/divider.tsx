import { cn } from '@/lib/utils'
import { resolveBlockStyle } from './custom-style'

export default function Divider({
  width = 'full',
  customCss,
  puckId,
}: {
  width?: 'full' | 'medium' | 'small'
  puckId?: string
  customCss?: string
}) {
  const { domId, styleEl } = resolveBlockStyle(customCss, undefined, puckId)
  return (
    <>
      {styleEl}
      <div
        id={domId}
        className={cn(
          'flex',
          width === 'medium' && 'justify-center',
          width === 'small' && 'justify-center',
        )}
      >
        <hr
          className={cn(
            'border-0 h-px bg-border/70',
            width === 'full' && 'w-full',
            width === 'medium' && 'w-2/3',
            width === 'small' && 'w-1/3',
          )}
        />
      </div>
    </>
  )
}
