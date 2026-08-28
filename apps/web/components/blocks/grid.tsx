import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { resolveBlockStyle } from './custom-style'

export type GridColumnData = {
  width?: string
  items?: () => ReactNode
}

const gapMap = { none: 'gap-0', sm: 'gap-3', md: 'gap-6', lg: 'gap-10' } as const

const alignMap = {
  stretch: 'items-stretch',
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
} as const

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

const widthClassMap = {
  equal: 'sm:flex-1',
  quarter: 'sm:w-1/4',
  third: 'sm:w-1/3',
  half: 'sm:w-1/2',
  twothirds: 'sm:w-2/3',
  threequarters: 'sm:w-3/4',
  full: 'sm:w-full',
} as const

export type RowProps = {
  columns?: GridColumnData[]
  responsive?: boolean
  colGap?: keyof typeof gapMap
  align?: keyof typeof alignMap
  justify?: keyof typeof justifyMap
}

export function Row({ columns, responsive = true, colGap = 'md', align = 'stretch', justify = 'start' }: RowProps) {
  const cols = columns?.length ? columns : [{ width: 'equal' }, { width: 'equal' }, { width: 'equal' }]
  return (
    <div
      className={cn(
        'flex flex-col',
        responsive && 'sm:flex-row',
        gapMap[colGap],
        alignMap[align],
        justifyMap[justify],
      )}
    >
      {cols.map((column, index) => (
        <div
          key={index}
          className={cn(
            'min-w-0',
            widthClassMap[(column.width ?? 'equal') as keyof typeof widthClassMap] ?? widthClassMap.equal,
          )}
        >
          {column.items?.()}
        </div>
      ))}
    </div>
  )
}

export type GridLayoutProps = {
  children?: () => ReactNode
  responsive?: boolean
  rowGap?: keyof typeof gapMap
  anchorId?: string
  puckId?: string
  customCss?: string
}

export default function Grid({ children, rowGap = 'md', anchorId, customCss, puckId }: GridLayoutProps) {
  const { domId, styleEl } = resolveBlockStyle(customCss, anchorId, puckId)
  return (
    <>
      {styleEl}
      <div id={domId} className={cn('flex flex-col', gapMap[rowGap])}>
      {children?.()}
    </div>
    </>
  )
}
