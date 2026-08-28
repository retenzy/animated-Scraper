import { resolveBlockStyle } from './custom-style'

export default function Spacer({
  height = 64,
  customCss,
  puckId,
}: {
  height?: number
  puckId?: string
  customCss?: string
}) {
  const { domId, styleEl } = resolveBlockStyle(customCss, undefined, puckId)
  return (
    <>
      {styleEl}
      <div id={domId} style={{ height: height ?? 64 }} aria-hidden />
    </>
  )
}
