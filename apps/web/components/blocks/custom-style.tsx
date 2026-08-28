import type { ReactNode } from 'react'

/**
 * Resolves a block's DOM id and produces a <style> element containing the
 * user's custom CSS, auto-scoped so selectors only affect this block.
 *
 * Selectors are prefixed with `#<domId>`. `&` can be used as shorthand for
 * the block root (e.g. `& { letter-spacing: 2px }`). @media / @supports are
 * scoped inside; @keyframes / @font-face bodies are left untouched.
 */
export function resolveBlockStyle(
  customCss?: string,
  anchorId?: string,
  puckId?: string,
): { domId?: string; styleEl: ReactNode } {
  const domId = sanitizeDomId(anchorId) ?? sanitizeDomId(puckId ? `blk-${puckId}` : undefined)
  if (!customCss || !customCss.trim()) {
    return { domId: anchorId ?? domId, styleEl: null }
  }
  if (!domId) {
    // No stable id available — emit unscoped rather than dropping the CSS.
    return {
      domId: undefined,
      styleEl: <style dangerouslySetInnerHTML={{ __html: stripComments(customCss) }} />,
    }
  }
  return {
    domId,
    styleEl: (
      <style
        dangerouslySetInnerHTML={{ __html: scopeCss(customCss, domId) }}
      />
    ),
  }
}

function sanitizeDomId(id?: string): string | undefined {
  if (!id) return undefined
  const clean = id.trim().replace(/[^a-zA-Z0-9_-]/g, '-')
  return /^[a-zA-Z]/.test(clean) ? clean : `b-${clean}`
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

export function scopeCss(css: string, scope: string): string {
  const src = stripComments(css)
  let out = ''
  let i = 0
  while (i < src.length) {
    const open = src.indexOf('{', i)
    if (open === -1) {
      out += src.slice(i)
      break
    }
    const selector = src.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++
      else if (src[j] === '}') depth--
      j++
    }
    const body = src.slice(open + 1, depth === 0 && j <= src.length ? j - 1 : j)
    if (selector.startsWith('@')) {
      if (/^@(keyframes|font-face|property)/i.test(selector)) {
        out += `${selector}{${body}}`
      } else {
        out += `${selector}{${scopeCss(body, scope)}}`
      }
    } else if (!selector) {
      out += body
    } else {
      const scoped = selector
        .split(',')
        .map((s) => {
          const t = s.trim()
          if (!t) return t
          if (t.includes('&')) return t.replace(/&/g, `#${scope}`)
          return `#${scope} ${t}`
        })
        .join(',')
      out += `${scoped}{${body}}`
    }
    i = j
  }
  return out
}
