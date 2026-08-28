import { cn } from '@/lib/utils'
import { blockStyleClasses, blockStyleVars, type BlockStyleProps } from './style-utils'
import { resolveBlockStyle } from './custom-style'

export default function Html({
  html,
  backgroundColor,
  textColor,
  padding,
  paddingMode,
  margin,
  marginMode,
  customCss,
  puckId,
}: { html?: string; puckId?: string } & BlockStyleProps) {
  if (!html) return null
  const { domId, styleEl } = resolveBlockStyle(customCss, undefined, puckId)
  return (
    <>
      {styleEl}
      <div
        id={domId}
        style={blockStyleVars({ backgroundColor, textColor })}
        className={cn(
          blockStyleClasses({ backgroundColor, textColor, padding, paddingMode, margin, marginMode }),
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
