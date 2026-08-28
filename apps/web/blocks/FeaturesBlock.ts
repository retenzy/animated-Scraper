import type { Block } from 'payload'

export const FeaturesBlock: Block = {
  slug: 'features',
  labels: {
    singular: 'Features',
    plural: 'Features Blocks',
  },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      label: 'Features',
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Icon key: zap, lock, download, chart, sync, globe',
          },
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
  ],
}
