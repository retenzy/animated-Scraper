import { NextRequest, NextResponse } from 'next/server'
import { validateBlocks, type WireBlock } from '@/lib/ai'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You generate sections for a visual page builder. Given a natural-language request, output a JSON tree of blocks.

Respond with ONLY valid JSON (no markdown, no code fences):
{ "blocks": [ ...one or more block objects... ] }

## BLOCK HIERARCHY

Page
└── (top-level blocks, in order)
     ├── Section            ← full-width band; wraps a group of content (use to group a section)
     │    └── children: Block[]           (any content/layout blocks)
     ├── Grid               ← multi-column layout
     │    └── cards: Card-ish objects    (one per column; rendered side by side, stack on mobile)
     ├── Heading / Subheading / Paragraph / List / Button   ← leaf content
     └── Card               ← boxed content; can also hold extra leaf blocks via items

## BLOCK CATALOG (props are whitelisted — do not invent others)

Section      { background: "none"|"muted"|"card"|"primary"|"#hex", padding: "none"|"sm"|"md"|"lg",
               maxWidth: "full"|"wide"|"container"|"narrow", anchorId?: "my-id",
               children: Block[] }
Grid         { columnCount: 1..6, cards: [ { title, text, features: ["..."], linkLabel, linkHref, icon? } ] }
             → renders as N equal columns; use whenever the user asks for columns/pricing tiers/feature grids.
Card         { icon: "none"|"zap"|"lock"|"download"|"chart"|"sync"|"globe", title, text,
               linkLabel, linkHref, items?: Block[] }   ← items hold extra leaf blocks inside the card
Heading      { text, level: "2"|"3"|"4", align: "left"|"center"|"right" }
Subheading   { text, align }                        ← small uppercase eyebrow line above a heading
Paragraph    { text }                               ← plain sentences; separate paragraphs not supported
List         { ordered: "yes"|"no", items: [{ text }] }
Button       { label, href, variant: "primary"|"outline"|"ghost"|"link", size: "default"|"sm"|"lg", align }

Optional on ANY block: { anchorId: "kebab-id", textColor: "#hex|token", backgroundColor: "#hex|token", css: "..." }

css — custom CSS scoped to this block only. Selectors are relative to the block
(use plain selectors like "h3", ".price", or "&" for the block root). Use it for
fine-grained styling the props can't express (hover states, gradients, spacing tweaks).
Example: { "kind": "Heading", "props": { "text": "Deals", "level": "2",
  "css": "& { background: linear-gradient(90deg,#7c3aed,#db2777); -webkit-background-clip: text; color: transparent; }" } }
Keep CSS minimal and purposeful; prefer props when they suffice.

## HIERARCHY RULES

1. Wrap a complete section (heading + content) in ONE Section block. Use background/padding to create visual bands (e.g. alternate "muted"/"none").
2. For any column layout (pricing tiers, feature grid, comparison), use Grid with one card per column. Do NOT put Grid inside Grid.
3. Inside a Section's children you may use: Heading, Subheading, Paragraph, List, Button, Grid, Card.
4. A typical section pattern:
   Section
    ├── Subheading  (eyebrow)
    ├── Heading     (h2)
    ├── Paragraph   (supporting copy)
    ├── Grid        (columns of cards)
    └── Button      (section-level CTA)
5. Heading levels must be hierarchical: one level-"2" heading per section; use "3" inside columns/cards.
6. Cards inside Grid already render title/text/features/link — pass those in the card object. Use a standalone Card block only when it needs extra nested blocks in items.
7. Keep copy concise and persuasive. 2–6 top-level blocks per generation is ideal.

## EXAMPLE

{ "blocks": [
  { "kind": "Section", "props": { "background": "muted", "padding": "lg", "children": [
      { "kind": "Subheading", "props": { "text": "Pricing", "align": "center" } },
      { "kind": "Heading", "props": { "text": "Simple, transparent plans", "level": "2", "align": "center" } },
      { "kind": "Paragraph", "props": { "text": "No hidden fees. Cancel anytime.", "align": "center" } },
      { "kind": "Grid", "props": { "columnCount": 3, "cards": [
          { "title": "Starter", "text": "For individuals", "features": ["1 project", "Email support"], "linkLabel": "Start free", "linkHref": "/" },
          { "title": "Pro", "text": "For teams", "features": ["Unlimited projects", "Priority support"], "linkLabel": "Choose Pro", "linkHref": "/" },
          { "title": "Business", "text": "At scale", "features": ["SLA", "Dedicated manager"], "linkLabel": "Contact sales", "linkHref": "/" }
      ] } },
      { "kind": "Button", "props": { "label": "Compare all features", "href": "/features", "variant": "ghost", "align": "center" } }
  ] } }
] }

Do not include commentary outside the JSON.`

function buildPrompt(instruction: string, pageTitle?: string): string {
  const context = pageTitle
    ? `\n\nThis section will be added to a page titled: "${pageTitle}". Match the tone and topic of that page.`
    : ''
  return `${instruction}${context}`
}

export async function POST(req: NextRequest) {
  if (process.env.AI_ENABLED !== 'true') {
    return NextResponse.json({ error: 'AI is not enabled.' }, { status: 501 })
  }

  const baseUrl = process.env.AI_BASE_URL ?? 'https://api.deepseek.com'
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL ?? 'deepseek-chat'

  if (!apiKey) {
    return NextResponse.json({ error: 'AI_API_KEY is not configured.' }, { status: 501 })
  }

  let body: { instruction?: string; pageTitle?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const instruction = (body.instruction ?? '').trim()
  if (!instruction) {
    return NextResponse.json({ error: 'Missing "instruction".' }, { status: 400 })
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`

  let up: Response
  try {
    up = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(instruction, body.pageTitle) },
        ],
      }),
    })
  } catch (err) {
    console.error('AI fetch failed', err)
    return NextResponse.json({ error: 'Could not reach the AI provider.' }, { status: 502 })
  }

  if (!up.ok) {
    const detail = await up.text().catch(() => '')
    console.error('AI provider error', up.status, detail)
    return NextResponse.json({ error: 'AI provider returned an error.' }, { status: 502 })
  }

  let json: { choices?: { message?: { content?: string } }[] } = {}
  try {
    json = await up.json()
  } catch {
    return NextResponse.json({ error: 'Malformed response from AI provider.' }, { status: 502 })
  }

  const content = json.choices?.[0]?.message?.content
  if (!content) {
    return NextResponse.json({ error: 'AI returned no content.' }, { status: 502 })
  }

  let parsed: { blocks?: WireBlock[] }
  try {
    parsed = JSON.parse(content)
  } catch {
    return NextResponse.json({ error: 'AI did not return valid JSON.' }, { status: 502 })
  }

  const blocks = validateBlocks(parsed.blocks ?? [])
  if (blocks.length === 0) {
    return NextResponse.json({ error: 'AI did not return any usable blocks.' }, { status: 422 })
  }

  return NextResponse.json({ blocks })
}