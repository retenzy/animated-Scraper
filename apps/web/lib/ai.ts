import type { Data } from '@puckeditor/core'

export type GenerateSectionResponse = {
  blocks?: WireBlock[]
  error?: string
}

export interface WireProps {
  [key: string]: unknown
}

export interface WireBlock {
  kind: string
  props: WireProps
}

// ---------- schema ----------

const LEAF_KINDS: string[] = ['Heading', 'Subheading', 'Paragraph', 'List', 'Button']
const CONTAINER_KINDS: string[] = ['Section', 'Grid', 'Card']
const ALL_KINDS = [...LEAF_KINDS, ...CONTAINER_KINDS]

const LEAF_DEFAULTS: Record<string, WireProps> = {
  Heading: { text: '', level: '2', align: 'left' },
  Subheading: { text: '', align: 'left' },
  Paragraph: { text: '' },
  List: { items: [], ordered: 'no' },
  Button: { label: '', href: '/', variant: 'primary', size: 'default', align: 'left' },
}

const ENUMS: Record<string, string[]> = {
  align: ['left', 'center', 'right'],
  level: ['2', '3', '4'],
  variant: ['primary', 'outline', 'ghost', 'link'],
  size: ['default', 'sm', 'lg'],
  ordered: ['yes', 'no'],
  padding: ['none', 'sm', 'md', 'lg'],
  maxWidth: ['full', 'wide', 'container', 'narrow'],
  background: ['none', 'muted', 'card', 'primary'],
  icon: ['none', 'zap', 'lock', 'download', 'chart', 'sync', 'globe', 'support'],
}

// Extra permissive props allowed on any block (styling / deep links)
const OPTIONAL_STRING_PROPS = ['anchorId', 'textColor', 'backgroundColor']
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|[a-z][a-zA-Z]*)$/

function str(v: unknown, max = 2000): string | undefined {
  return typeof v === 'string' ? v.slice(0, max) : undefined
}

function enumOrString(v: unknown, key: string): string | undefined {
  if (typeof v !== 'string') return undefined
  if (ENUMS[key]?.includes(v)) return v
  // background/textColor also accept raw hex
  if ((key === 'background' || key === 'textColor' || key === 'backgroundColor') && /^#[0-9a-fA-F]{3,8}$/.test(v)) return v
  return undefined
}

function extractCustomCss(props: WireProps): string | undefined {
  const raw = props.css ?? props.customCss
  if (typeof raw !== 'string' || !raw.trim()) return undefined
  return raw.slice(0, 10000)
}

function sanitizeLeafProps(kind: string, props: WireProps): WireProps {
  const out: WireProps = {}
  const defaults = LEAF_DEFAULTS[kind]
  for (const key of Object.keys(defaults)) {
    const value = props[key]
    if (value === undefined || value === null) {
      out[key] = defaults[key]
    } else if (key === 'items' && Array.isArray(value)) {
      out[key] = value.filter((i) => i && typeof i.text === 'string').slice(0, 30)
    } else if (ENUMS[key]) {
      out[key] = enumOrString(value, key) ?? defaults[key]
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value
    } else {
      out[key] = defaults[key]
    }
  }
  for (const key of OPTIONAL_STRING_PROPS) {
    const v = str(props[key], 100)
    if (v === undefined) continue
    if (key === 'anchorId' && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(v)) out[key] = v
    if (key !== 'anchorId' && COLOR_RE.test(v)) out[key] = v
  }
  const css = extractCustomCss(props)
  if (css) out.customCss = css
  return out
}

function sanitizeCardObj(raw: unknown): WireProps {
  if (!raw || typeof raw !== 'object') return { title: '', text: '' }
  const c = raw as Record<string, unknown>
  const out: WireProps = {
    title: str(c.title, 200) ?? '',
    text: str(c.text, 600) ?? '',
    linkLabel: str(c.linkLabel, 100),
    linkHref: str(c.linkHref, 500),
    icon: enumOrString(c.icon, 'icon') ?? 'none',
  }
  if (Array.isArray(c.features)) {
    out.features = c.features.filter((f): f is string => typeof f === 'string').slice(0, 12)
  }
  return out
}

const MAX_DEPTH = 3

/** Recursively validates a wire block. Returns null when the block is unusable. */
export function validateBlock(raw: unknown, depth = 0): WireBlock | null {
  if (depth > MAX_DEPTH) return null
  if (!raw || typeof raw !== 'object') return null
  const block = raw as WireBlock
  if (typeof block.kind !== 'string' || !ALL_KINDS.includes(block.kind)) return null
  const props = (block.props && typeof block.props === 'object' ? block.props : {}) as WireProps

  if (block.kind === 'Section') {
    const children = Array.isArray(props.children)
      ? props.children.map((child) => validateBlock(child, depth + 1)).filter((b): b is WireBlock => b !== null)
      : []
    return {
      kind: 'Section',
      props: {
        background: enumOrString(props.background, 'background') ?? 'none',
        padding: enumOrString(props.padding, 'padding') ?? 'lg',
        maxWidth: enumOrString(props.maxWidth, 'maxWidth') ?? 'container',
        ...(typeof props.anchorId === 'string' && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(props.anchorId)
          ? { anchorId: props.anchorId }
          : {}),
        ...(extractCustomCss(props) ? { customCss: extractCustomCss(props) } : {}),
        children,
      },
    }
  }

  if (block.kind === 'Grid') {
    const cards = Array.isArray(props.cards) ? props.cards.map(sanitizeCardObj).slice(0, 6) : []
    if (cards.length === 0) return null
    const columnCount = Math.min(Math.max(Number(props.columnCount) || cards.length, 1), 6)
    const css = extractCustomCss(props)
    return { kind: 'Grid', props: css ? { columnCount, cards, customCss: css } : { columnCount, cards } }
  }

  if (block.kind === 'Card') {
    const items = Array.isArray(props.items)
      ? props.items.map((child) => validateBlock(child, depth + 1)).filter((b): b is WireBlock => b !== null)
      : []
    const out: WireProps = {
      icon: enumOrString(props.icon, 'icon') ?? 'none',
      title: str(props.title, 200) ?? '',
      text: str(props.text, 800) ?? '',
      linkLabel: str(props.linkLabel, 100) ?? '',
      linkHref: str(props.linkHref, 500) ?? '',
      items,
    }
    const css = extractCustomCss(props)
    if (css) out.customCss = css
    return { kind: 'Card', props: out }
  }

  if (LEAF_DEFAULTS[block.kind]) {
    return { kind: block.kind, props: sanitizeLeafProps(block.kind, block.props ?? {}) }
  }

  return null
}

export function validateBlocks(raw: unknown): WireBlock[] {
  if (!Array.isArray(raw)) return []
  const blocks: WireBlock[] = []
  for (const item of raw.slice(0, 16)) {
    const valid = validateBlock(item)
    if (valid) blocks.push(valid)
  }
  return blocks.slice(0, 12)
}

// ---------- puck data builders ----------

type NodeRef = {
  type: string
  props: Record<string, unknown>
}

let idCounter = 0
function uid(kind: string): string {
  idCounter += 1
  return `${kind}-${Date.now().toString(36)}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

function node(type: string, props: WireProps): NodeRef {
  return { type, props: { ...props, id: uid(type) } }
}

function buildFeatureList(features: unknown): NodeRef | null {
  if (!Array.isArray(features) || features.length === 0) return null
  return node('List', { items: features.map((text) => ({ text })), ordered: 'no' })
}

function buildGridNode(block: WireBlock): NodeRef {
  const { columnCount, cards } = {
    columnCount: Number(block.props.columnCount) || 2,
    cards: (block.props.cards ?? []) as WireProps[],
  }
  const cols = (cards.slice(0, columnCount) as WireProps[]).concat(
    Array(Math.max(0, columnCount - cards.length)).fill({}) as WireProps[],
  )
  return node('Grid', {
    responsive: 'yes',
    rowGap: 'md',
    ...(extractCustomCss(block.props) ? { customCss: extractCustomCss(block.props) } : {}),
    children: [
      node('Row', {
        colGap: 'md',
        columns: cols.map((card, index) => {
          const items: NodeRef[] = []
          const featureList = buildFeatureList(card.features)
          if (featureList) items.push(featureList)
          if (card.title || card.text || card.linkLabel || card.linkHref) {
            items.push(
              node('Card', {
                icon: card.icon ?? 'none',
                backgroundColor: 'card',
                title: card.title ?? '',
                text: card.text ?? '',
                linkLabel: card.linkLabel ?? '',
                linkHref: card.linkHref ?? '/',
                ...(extractCustomCss(card) ? { customCss: extractCustomCss(card) } : {}),
              }),
            )
          }
          void index
          return { width: 'equal', id: uid('Column'), items }
        }),
      }),
    ],
  })
}

function toNode(block: WireBlock): NodeRef {
  switch (block.kind) {
    case 'Grid':
      return buildGridNode(block)
    case 'Section':
      return node('Section', {
        background: block.props.background ?? 'none',
        padding: block.props.padding ?? 'lg',
        maxWidth: block.props.maxWidth ?? 'container',
        ...(block.props.anchorId ? { anchorId: block.props.anchorId } : {}),
        ...(block.props.customCss ? { customCss: block.props.customCss } : {}),
        children: (block.props.children as WireBlock[]).map(toNode),
      })
    case 'Card':
      return node('Card', {
        icon: block.props.icon ?? 'none',
        title: block.props.title ?? '',
        text: block.props.text ?? '',
        linkLabel: block.props.linkLabel ?? '',
        linkHref: block.props.linkHref ?? '',
        ...(Array.isArray(block.props.items) && block.props.items.length > 0
          ? { items: (block.props.items as WireBlock[]).map(toNode) }
          : {}),
      })
    default:
      return node(block.kind, block.props)
  }
}

type PuckDataShape = {
  root?: {
    props?: Record<string, unknown>
    id?: string
    title?: string
    readOnly?: { title?: boolean }
    zones?: Record<string, NodeRef[]>
  }
  content?: NodeRef[]
}

export function toPuckData(existing: Partial<Data>, blocks: WireBlock[]): PuckDataShape {
  const additions = blocks.map(toNode)
  const currentRoot = (existing.root as PuckDataShape['root']) ?? {}
  // Canonical source of truth is `content`. Older saved pages kept items in
  // root.zones.content — seed from there so nothing is lost.
  const seed: NodeRef[] =
    existing.content && existing.content.length > 0
      ? (existing.content as NodeRef[])
      : currentRoot.zones?.content ?? []
  const newContent = [...seed, ...additions]
  // Write ONLY to `content` (the canonical puck root zone). Writing the same
  // nodes to root.zones.content as well caused Puck to render them twice,
  // producing duplicate React keys in the outline tree.
  return {
    ...existing,
    content: newContent,
  }
}
