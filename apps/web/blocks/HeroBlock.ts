import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Hero Blocks',
  },
  fields: [
    { name: 'badge', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'highlightedText', type: 'text', label: 'Highlighted Text (accent color)' },
    { name: 'subtitle', type: 'textarea' },
    { name: 'primaryCtaLabel', type: 'text', defaultValue: 'Get started' },
    { name: 'secondaryCtaLabel', type: 'text', defaultValue: 'Install extension' },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistics',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}
