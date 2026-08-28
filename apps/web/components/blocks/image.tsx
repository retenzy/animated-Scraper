import Image from 'next/image'
import { resolveBlockStyle } from './custom-style'
import { cn } from '@/lib/utils'

const ratios = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[16/7]',
} as const

export default function ImageBlock({
  src,
  alt,
  caption,
  ratio = 'video',
  align = 'left',
  rounded = true,
  anchorId,
  customCss,
  puckId,
}: {
  src?: string
  alt?: string
  caption?: string
  ratio?: keyof typeof ratios
  align?: 'left' | 'center' | 'right'
  rounded?: boolean
  anchorId?: string
  puckId?: string
  customCss?: string
}) {
  if (!src) return null
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <figure
      id={domId}
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl overflow-hidden bg-muted',
          ratios[ratio],
          rounded && 'rounded-xl border border-border',
        )}
      >
        <Image src={src} alt={alt || ''} fill sizes="(max-width: 1024px) 100vw, 672px" className="object-cover" />
      </div>
      {caption && <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
    </>
  )
}
