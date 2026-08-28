import { getPayload } from 'payload'
import config from '@payload-config'

type PuckNode = {
  type?: string
  props?: Record<string, unknown>
  zones?: Record<string, unknown>
  [k: string]: unknown
}

const reshapeComponent = (type: string, props: Record<string, unknown>): Record<string, unknown> | null => {
  if ('content' in props) return null

  switch (type) {
    case 'Hero':
      return {
        content: {
          badge: props.badge,
          title: props.title,
          highlightedText: props.highlightedText,
          subtitle: props.subtitle,
        },
        callToAction: {
          primaryCtaLabel: props.primaryCtaLabel,
          secondaryCtaLabel: props.secondaryCtaLabel,
        },
        stats: props.stats,
      }
    case 'Features':
    case 'Testimonials':
    case 'Faq':
      return {
        content: {
          heading: props.heading,
          subheading: props.subheading,
        },
        items: props.items,
      }
    case 'Statistics':
      return {
        content: {
          heading: props.heading,
          subheading: props.subheading,
        },
        stats: props.stats,
      }
    case 'HowItWorks':
      return {
        content: {
          heading: props.heading,
          subheading: props.subheading,
        },
        steps: props.steps,
        benefits: {
          title: props.benefitsTitle,
          items: props.benefits,
        },
      }
    case 'Cta':
      return {
        content: {
          heading: props.heading,
          subtitle: props.subtitle,
        },
        buttonLabel: props.buttonLabel,
      }
    default:
      return null
  }
}

const reshapeNodes = (nodes: PuckNode[] | undefined): boolean => {
  if (!Array.isArray(nodes)) return false
  let changed = false
  for (const node of nodes) {
    if (!node.props) continue
    const reshaped = reshapeComponent(String(node.type ?? ''), node.props)
    if (reshaped) {
      node.props = reshaped
      changed = true
    }
  }
  return changed
}

const run = async () => {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { layoutMode: { equals: 'puck' } },
    pagination: false,
    depth: 0,
  })

  let migrated = 0
  for (const page of docs) {
    const content = (page.puckContent ?? {}) as { root?: { zones?: { content?: PuckNode[] } }; content?: PuckNode[] }
    const rootChanged = reshapeNodes(content.root?.zones?.content)
    const contentChanged = reshapeNodes(content.content)

    if (!rootChanged && !contentChanged) continue

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { puckContent: content },
    })
    migrated += 1
    console.log(`✓ Reshaped puckContent for page: ${page.title}`)
  }

  console.log(migrated === 0 ? 'No legacy puck pages found.' : `Migration complete. ${migrated} page(s) updated.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
