import type { Block } from 'payload'

export const CtaBlock: Block = {
  slug: 'cta',
  labels: {
    singular: 'CTA',
    plural: 'CTA Blocks',
  },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subtitle', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Get started' },
  ],
}
